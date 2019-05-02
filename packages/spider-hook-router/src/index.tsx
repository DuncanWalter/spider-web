// import { createBrowserHistory, History, Location, Action } from 'history'
// import React, { useContext, useEffect, ReactElement } from 'react'
// import {
//   Action as SpiderAction,
//   useActions,
//   useSelector,
// } from '@dwalter/spider-hook'
import pathToRegexp, { Key } from 'path-to-regexp'
import { isAbsolute, join, formalize } from './join'
import { isPromise } from './utils'
import { History } from 'history'

export type Route<T> = T | string | Router<T> | ThunkRoute<T> | AsyncRoute<T>
export type Router<T> = { [path: string]: Route<T> }
type ThunkRoute<T> = () => Route<T>
interface AsyncRoute<T> extends Promise<Route<T>> {}

export interface ResolutionContext<T> {
  path: string
  match: string
  route: null | T | string
  params: { [param: string]: string }
  isTerminal(route: Route<T>): route is T
  router: Router<T>
  history: History
}

export type ResolutionResult<T> =
  | [string | T | null, ResolutionContext<T>]
  | Promise<[string | T | null, ResolutionContext<T>]>

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

function interpretRoute<T>(
  route: Route<T>,
  ctx: ResolutionContext<T>,
): ResolutionResult<T> {
  if (ctx.isTerminal(route)) {
    return [route, { ...ctx, route }]
  } else if (typeof route === 'string') {
    if (isAbsolute(route)) {
      return [route, { ...ctx, route }]
    } else {
      const path = join(ctx.match, route)
      return [path, { ...ctx, route: path }]
    }
  } else if (typeof route === 'function') {
    return interpretRoute(route(), ctx)
  } else if (isPromise(route)) {
    return route.then(syncRoute => interpretRoute(syncRoute, ctx))
  } else if (typeof route === 'object') {
    return selectRoute({ ...ctx, router: route })
  } else {
    return [null, { ...ctx, route: null }]
  }
}

export function selectRoute<T>(ctx: ResolutionContext<T>): ResolutionResult<T> {
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

      const combinedParams = {
        ...ctx.params,
        ...parameters.reduce(
          (acc, param, i) => {
            acc[keys[i].name] = param
            return acc
          },
          {} as { [param: string]: string },
        ),
      }

      return interpretRoute(route, {
        ...ctx,
        path: path.slice(match.length),
        match: `${ctx.match}${match}`,
        params: combinedParams,
      })
    }
  }

  return [null, ctx]
}
