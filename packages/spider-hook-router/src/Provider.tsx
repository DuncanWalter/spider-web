import React, { ReactElement, useMemo, ReactNode, useEffect } from 'react'
import { History, createHashHistory } from 'history'
import { RootContext, MatchResult } from './types'
import {
  useForceUpdate,
  LocalRoutingContext,
  GlobalRoutingContext,
} from './push'

interface ProviderProps {
  history: History
  children: ReactNode
}

export function Provider({ history, children }: ProviderProps) {
  const ctx: RootContext = useMemo(
    () => ({
      history,
      isTerminal: isReactElement,
      currentPath: history.location.pathname,
    }),
    [],
  )

  const forceUpdate = useForceUpdate()

  useEffect(() => {
    const unsubscribe = history.listen(location => {
      ctx.currentPath = location.pathname
      forceUpdate()
    })
    return unsubscribe
  }, [])

  const match: MatchResult = useMemo(
    () => ({
      path: ctx.currentPath,
      globalMatch: '',
      localMatch: '',
      router: {},
      params: {},
      route: null,
    }),
    [ctx.currentPath],
  )

  return (
    <GlobalRoutingContext.Provider value={ctx}>
      <LocalRoutingContext.Provider value={match}>
        {children}
      </LocalRoutingContext.Provider>
    </GlobalRoutingContext.Provider>
  )
}

function isReactElement(arg: any): arg is ReactElement {
  return arg && typeof arg === 'object' && '$$typeof' in arg
}
