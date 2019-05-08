import { History } from 'history'
import { ReactElement } from 'react'

export type Route = ReactElement | string | Router | ThunkRoute | AsyncRoute
export type Router = { [path: string]: Route }
type ThunkRoute = (match: ThunkRouteParams) => Route
interface AsyncRoute extends Promise<Route> {}

interface ThunkRouteParams {
  params: { [param: string]: string }
  exact: boolean
  match: string
}

export interface MatchRequest {
  router: Router
  path: string
  globalMatch: string
  localMatch: string
  params: { [param: string]: string }
}

export interface MatchResult {
  route: string | ReactElement | null
  router: Router
  path: string
  globalMatch: string
  localMatch: string
  params: { [param: string]: string }
}

export type AsyncMatchResult = Promise<MatchResult> | MatchResult

export interface RootContext {
  history: History
  currentPath: string
  isTerminal(route: Route): route is ReactElement
}
