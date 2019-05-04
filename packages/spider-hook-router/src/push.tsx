import React, { useReducer } from 'react'

import { isPromise } from './utils'
import { isAbsolute, join, formalize } from './join'
import {
  MatchResult,
  RootContext,
  Router as __Router__,
  Route,
  MatchRequest,
  AsyncMatchResult,
} from './types'
import { createContext, useContext, useRef } from 'react'
import pathToRegexp from 'path-to-regexp'

function interpretRoute<T>(
  route: Route<T>,
  request: MatchRequest<T>,
  ctx: RootContext<T>,
): AsyncMatchResult<T> {
  if (ctx.isTerminal(route)) {
    return assignRoute(route, request)
  } else if (typeof route === 'string') {
    return assignRoute(resolvePath(route, request), request)
  } else if (typeof route === 'function') {
    return interpretRoute(route(), request, ctx)
  } else if (isPromise(route)) {
    return route.then(syncRoute => interpretRoute(syncRoute, request, ctx))
  } else if (typeof route === 'object') {
    return matchRoute({ ...request, router: route }, ctx)
  } else {
    return assignRoute(null, request)
  }
}

function matchRoute<T>(
  request: MatchRequest<T>,
  ctx: RootContext<T>,
): AsyncMatchResult<T> {
  const { router, path } = request

  for (let routerPath of Object.keys(router)) {
    const keys: pathToRegexp.Key[] = []
    const pattern = pathToRegexp(`${formalize(routerPath)}`, keys, {
      end: false,
    })
    const parse = pattern.exec(path)
    if (parse) {
      const [match, ...parameters] = parse

      const route = router[routerPath]

      const combinedParams = {
        ...request.params,
        ...parameters.reduce(
          (acc, param, i) => {
            acc[keys[i].name] = param
            return acc
          },
          {} as { [param: string]: string },
        ),
      }

      const innerRequest = {
        router: request.router,
        path: path.slice(match.length),
        globalMatch: `${request.globalMatch}${match}`,
        localMatch: match,
        params: combinedParams,
        parent: request,
      }

      return interpretRoute(route, innerRequest, ctx)
    }
  }

  return assignRoute(null, request)
}

function assignRoute<T>(
  route: T | string | null,
  request: MatchRequest<T>,
): MatchResult<T> {
  return {
    ...request,
    route,
  }
}

// function createHistoryAccessor<T>(match: MatchResult<T>, ctx: RootContext<T>) {
//   return function accessHistory(
//     path: string,
//     callback: (path: string, history: History) => unknown,
//   ) {
//     let proposedPath: string
//     const currentPath = ctx.currentPath

//     if (isAbsolute(path)) {
//       proposedPath = path
//       if (currentPath === path) return
//     } else {
//       proposedPath = join(match.match, path)
//       if (currentPath === proposedPath) return
//     }

//     const result = matchRoute(
//       { path, match: '', params: {}, router: match.router },
//       ctx,
//     )

//     if (isPromise(result)) {
//       result.then(({ route }) => {
//         if (typeof route === 'string') {
//           accessHistory(route, callback)
//         } else {
//           callback(path, history)
//         }
//       })
//     } else {
//       const { route } = result
//       if (typeof route === 'string') {
//         accessHistory(route, callback)
//       } else {
//         callback(path, history)
//       }
//     }
//   }
// }

export const GlobalRoutingContext = createContext<
  RootContext<React.ReactElement>
>({} as any)
export const LocalRoutingContext = createContext<
  MatchResult<React.ReactElement>
>({} as any)

export function useHistory() /*(
  path: string,
  callback: (path: string, history: History) => unknown,
) => void */ {
  const ctx = useContext(GlobalRoutingContext)
  const match = useContext(LocalRoutingContext)

  const historyAPI = {
    push(path: string) {
      ctx.history.push(resolvePath(path, match))
    },
    replace(path: string) {
      ctx.history.replace(resolvePath(path, match))
    },
    goBack: ctx.history.goBack,
    goForward: ctx.history.goForward,
  }

  return historyAPI //createHistoryAccessor(match, ctx)
}

type Match = MatchResult<React.ReactElement>
type Router = __Router__<React.ReactElement>
type AsyncMatch = Match | Promise<Match>

// For optimization, the rule needs to be that this ONLY
// cares to recheck stuff when the outerMatch updates.
// When outerMatch updates, the whole thing cycles.
// Else, it will just return the latest match it has.
// The root service provider will have a hook that watches
// the actual provided context.
export function useRouter(router: Router): React.ReactElement {
  const ctx = useContext(GlobalRoutingContext)
  const outerMatch = useContext(LocalRoutingContext)
  const outerMatchChanged = useDidChange(outerMatch)

  const forceUpdate = useForceUpdate()

  const { replace } = useHistory()

  let nextInnerMatch: AsyncMatch

  const lastInnerMatchRef = useRef<Match>({
    ...outerMatch,
    route: null,
  })

  if (outerMatchChanged) {
    nextInnerMatch = matchRoute(
      {
        ...outerMatch,
        localMatch: '',
        router,
      },
      ctx,
    )
  } else {
    nextInnerMatch = lastInnerMatchRef.current
  }

  if (isPromise(nextInnerMatch)) {
    nextInnerMatch.then(innerMatch => {
      if (typeof innerMatch.route == 'string') {
        if (innerMatch.route !== ctx.currentPath) {
          ctx.history.push(innerMatch.route)
        }
      } else {
        lastInnerMatchRef.current = innerMatch
        forceUpdate()
      }
    })
  } else {
    if (typeof nextInnerMatch.route == 'string') {
      if (nextInnerMatch.route !== ctx.currentPath) {
        replace(nextInnerMatch.route)
      }
    } else {
      lastInnerMatchRef.current = nextInnerMatch
    }
  }

  return (
    <LocalRoutingContext.Provider value={lastInnerMatchRef.current}>
      {lastInnerMatchRef.current.route}
    </LocalRoutingContext.Provider>
  )
}

const constant = {}
export function useDidChange<T>(nextValue: T) {
  const lastValue = useRef(constant)
  if (lastValue.current !== nextValue) {
    lastValue.current = nextValue
    return true
  } else {
    return false
  }
}

export function useForceUpdate() {
  const [, forceUpdate] = useReducer(i => ++i, 0)
  return forceUpdate as () => void
}

function resolvePath(path: string, request: MatchRequest<any>) {
  if (isAbsolute(path)) {
    return path
  } else {
    return join(
      request.globalMatch.slice(
        0,
        request.globalMatch.length - request.localMatch.length,
      ),
      path,
    )
  }
}

// const noop: never = (() => {}) as never
