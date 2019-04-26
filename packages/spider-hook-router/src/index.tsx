// import { createBrowserHistory, History, Location, Action } from 'history'
// import React, { useContext, useEffect, ReactElement } from 'react'
// import {
//   Action as SpiderAction,
//   useActions,
//   useSelector,
// } from '@dwalter/spider-hook'
import pathToRegexp, { Key } from 'path-to-regexp'
import { isAbsolute, join, formalize } from './join'

type Route<T> = T | string | Router<T> | ThunkRoute<T> | AsyncRoute<T>
type Router<T> = { [path: string]: Route<T> }
type ThunkRoute<T> = () => Route<T>
interface AsyncRoute<T> extends Promise<Route<T>> {}

interface ResolutionContext<T> {
  path: string
  match: string
  params: { [param: string]: string }
  isTerminal(route: Route<T>): route is T
  router: Router<T>
}

// interface HistoryState {
//   location: Location
//   action: Action
// }

// interface HistoryAction extends SpiderAction {
//   type: '@history/update-history'
//   location: Location
//   action: Action
// }

// const HistoryContext = React.createContext<null | History>(null)

// interface HistoryProviderProps {
//   history?: History
//   children: React.ReactNode
// }

// function historyReducer(
//   state = null as HistoryState | null,
//   { type, action, location }: HistoryAction,
// ) {
//   if (type === '@history/update-history') {
//     return { action, location }
//   }
//   return state
// }

// function updateHistory(location: Location, action: Action): HistoryAction {
//   return {
//     type: '@history/update-history',
//     location,
//     action,
//     reducers: [historyReducer],
//   }
// }

// function HistoryProvider({
//   history = createBrowserHistory(),
//   children,
// }: HistoryProviderProps) {
//   const actions = useActions({ updateHistory })

//   useEffect(() => {
//     actions.updateHistory(history.location, history.action)
//     return history.listen(actions.updateHistory)
//   }, [])

//   useSelector(historyReducer)

//   return (
//     <HistoryContext.Provider value={history}>
//       {children}
//     </HistoryContext.Provider>
//   )
// }

// function useHistory() {
//   return useContext(HistoryContext)
// }

// function useRouter(
//   // match: string | Match,
//   router: Router<ReactElement>,
//   fallback?: React.ReactNode,
// ) {
//   const history = useHistory()

//   if (history === null) {
//     // TODO: awfulness incarnate
//     return undefined as never
//   }

//   const { pathname, search, hash } = history.location

//   Object.keys(router).find(path => {
//     const parse = pathToRegexp(`${match}${path}`).exec(
//       `${pathname}${search}${hash}`,
//     )
//     console.log(parse)
//     return !!parse
//   })
// }

function interpret<T>(
  route: Route<T>,
  ctx: ResolutionContext<T>,
): [string | T | AsyncRoute<T> | null, ResolutionContext<T>] {
  const { isTerminal } = ctx
  if (isTerminal(route)) {
    return [route, ctx]
  } else if (typeof route === 'string') {
    if (isAbsolute(route)) {
      return [route, ctx]
    } else {
      return [join(ctx.match, route), ctx]
    }
  } else if (typeof route === 'function') {
    return interpret(route(), ctx)
  } else if (isPromise(route)) {
    return [route, ctx]
  } else if (typeof route === 'object') {
    return selectRoute({ ...ctx, router: route })
  } else {
    return [null, ctx]
  }
}

function selectRoute<T>(
  ctx: ResolutionContext<T>,
): [string | T | AsyncRoute<T> | null, ResolutionContext<T>] {
  const { router, path } = ctx

  for (let routerPath of Object.keys(router)) {
    const keys: Key[] = []
    const pattern = pathToRegexp(`${formalize(routerPath)}`, keys, {
      end: false,
    })
    const parse = pattern.exec(path)
    if (parse) {
      const [match, ...parameters] = parse

      const route = router[routerPath]

      return interpret(route, {
        ...ctx,
        path: path.slice(match.length),
        match: `${ctx.match}${match}`,
        params: {
          ...ctx.params,
          ...parameters.reduce(
            (acc, param, i) => {
              acc[keys[i].name] = param
              return acc
            },
            {} as { [param: string]: string },
          ),
        },
      })
    }
  }
  return [null, ctx]
}

function isPromise(arg: unknown): arg is Promise<any> {
  return arg && Promise && arg instanceof Promise
}

type ResolutionQuery<T> = Partial<ResolutionContext<T>> & {
  router: Router<T>
  path: string
  isTerminal: (arg: unknown) => arg is T
}

export function resolve<T>({
  router,
  path,
  isTerminal,
  match = '',
  params = {},
}: ResolutionQuery<T>) {
  return selectRoute({
    router,
    params,
    path,
    match,
    isTerminal,
  })
}
