import React, { useReducer, ReactElement } from 'react'

import { isPromise } from './utils'
import { isAbsolute, join, formalize } from './join'
import {
  MatchResult,
  RootContext,
  Router,
  Route,
  MatchRequest,
  AsyncMatchResult,
} from './types'
import { createContext, useContext, useRef } from 'react'
import pathToRegexp from 'path-to-regexp'

function interpretRoute(
  route: Route,
  request: MatchRequest,
  ctx: RootContext,
): AsyncMatchResult {
  if (ctx.isTerminal(route)) {
    return assignRoute(route, request)
  } else if (typeof route === 'string') {
    return assignRoute(resolvePath(route, request), request)
  } else if (typeof route === 'function') {
    return interpretRoute(
      route({
        params: request.params,
        exact: request.path === '',
        match: request.globalMatch,
      }),
      request,
      ctx,
    )
  } else if (isPromise(route)) {
    return route.then(syncRoute => interpretRoute(syncRoute, request, ctx))
  } else if (typeof route === 'object') {
    return matchRoute({ ...request, router: route }, ctx)
  } else {
    return assignRoute(null, request)
  }
}

function pickRoute(
  cases: string[],
  request: MatchRequest,
  ctx: RootContext,
): AsyncMatchResult {
  const { router, path } = request
  const [casePath, ...rest] = cases

  if (!rest.length) {
    return assignRoute(null, request)
  }

  const keys: pathToRegexp.Key[] = []
  const pattern = pathToRegexp(`${formalize(casePath)}`, keys, {
    end: false,
  })
  const parse = pattern.exec(path)
  if (parse) {
    const [match, ...parameters] = parse

    const route = router[casePath]

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

    const result = interpretRoute(route, innerRequest, ctx)

    if (isPromise(result)) {
      return result.then(route => {
        if (route === null) {
          return pickRoute(rest, request, ctx)
        } else {
          return result
        }
      })
    } else {
      if (result.route === null) {
        return pickRoute(rest, request, ctx)
      } else {
        return result
      }
    }
  } else {
    if (rest.length) {
      return pickRoute(rest, request, ctx)
    } else {
      return assignRoute(null, request)
    }
  }
}

function matchRoute(request: MatchRequest, ctx: RootContext): AsyncMatchResult {
  const { router } = request

  return pickRoute(Object.keys(router), request, ctx)
}

function assignRoute(
  route: ReactElement | string | null,
  request: MatchRequest,
): MatchResult {
  return {
    ...request,
    route,
  }
}

export const GlobalRoutingContext = createContext<RootContext>({} as any)
export const LocalRoutingContext = createContext<MatchResult>({} as any)

export function useHistory() {
  const ctx = useContext(GlobalRoutingContext)
  const match = useContext(LocalRoutingContext)

  return {
    push(path: string) {
      ctx.history.push(resolvePath(path, match))
    },
    replace(path: string) {
      ctx.history.replace(resolvePath(path, match))
    },
    goBack: ctx.history.goBack,
    goForward: ctx.history.goForward,
    location: ctx.history.location,
    block: ctx.history.block,
    params: match.params,
  }
}

type Match = MatchResult
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
    const lastInnerMatch = lastInnerMatchRef.current
    nextInnerMatch.then(innerMatch => {
      if (lastInnerMatch === lastInnerMatchRef.current) {
        if (typeof innerMatch.route == 'string') {
          if (innerMatch.route !== ctx.currentPath) {
            replace(innerMatch.route)
          }
        } else {
          lastInnerMatchRef.current = innerMatch
          forceUpdate()
        }
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

function resolvePath(path: string, request: MatchRequest) {
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
