import { History } from 'history'

export type Route<T> = T | string | Router<T> | ThunkRoute<T> | AsyncRoute<T>
export type Router<T> = { [path: string]: Route<T> }
type ThunkRoute<T> = () => Route<T>
interface AsyncRoute<T> extends Promise<Route<T>> {}

export interface MatchRequest<T> {
  router: Router<T>
  path: string
  globalMatch: string
  localMatch: string
  params: { [param: string]: string }
}

export interface MatchResult<T> {
  route: string | T | null
  router: Router<T>
  path: string
  globalMatch: string
  localMatch: string
  params: { [param: string]: string }
}

export type AsyncMatchResult<T> = Promise<MatchResult<T>> | MatchResult<T>

export interface RootContext<T> {
  history: History
  currentPath: string
  isTerminal(route: Route<T>): route is T
}
