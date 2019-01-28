import { useContext, useState } from 'react'

import {
  Dispatch,
  Action,
  ActionList,
  Store,
  Slice,
} from '@dwalter/spider-store'

import { StoreContext } from './SpiderRoot'
import { useIsFirstRender, noop } from './utils'
import { Source } from './useSelector'
import { getSlice } from './getSlice'

type SourceValues<Sources extends Source<any>[]> = {
  [K in keyof Sources]: Sources[K] extends Source<infer T> ? T : never
}

type SourceSlices<Sources extends Source<any>[]> = {
  [K in keyof Sources]: Sources[K] extends Source<infer T> ? Slice<T> : never
}

interface ThunkAction<Result = any> {
  (dispatch: Dispatch): Result
}

interface ActionCreator<Args extends any[]> {
  (...args: Args): Action | ActionList
}

interface ActionScheduler<Args extends any[], Result> {
  (...args: Args): ThunkAction<Result>
}

type BindableAction =
  | Action
  | ActionList
  | ActionCreator<any[]>
  | ActionScheduler<any[], any>

type BoundAction<A extends BindableAction> = A extends Action
  ? () => void
  : A extends ActionCreator<infer Args>
  ? (...args: Args) => void
  : A extends ActionScheduler<infer Args, infer Result>
  ? (...args: Args) => Result
  : never

interface BindableActionMap {
  [key: string]: BindableAction
}

type BoundActionMap<Actions extends BindableActionMap> = {
  [K in keyof Actions]: BoundAction<Actions[K]>
}

export function useActions<Actions extends BindableActionMap>(
  actions: Actions,
): BoundActionMap<Actions> {
  const store = useContext(StoreContext)
  const setup = useIsFirstRender()
  const boundActions = useState(
    setup
      ? () => {
          return Object.keys(actions).reduce(
            (acc, key) => {
              acc[key] = bindAction(store, actions[key] as BindableAction)
              return acc
            },
            {} as BoundActionMap<Actions>,
          )
        }
      : noop,
  )[0]
  return boundActions
}

function bindAction<Action extends BindableAction>(
  store: Store,
  action: BindableAction,
): BoundAction<Action>

function bindAction(store: Store, action: Action | ActionList | Function) {
  const { dispatch } = store
  if (typeof action === 'function') {
    return function() {
      return dispatch(action.apply(null, arguments))
    }
  } else {
    return () => dispatch(action)
  }
}

export function createCustomAction<Sources extends Source[], Result>(
  sources: Sources,
  thunk: (dispatch: Dispatch, ...state: SourceValues<Sources>) => Result,
): ThunkAction<Result> {
  return function(dispatch) {
    const slices = sources.map(source => getSlice(dispatch, source))
    return dispatch(thunk as any, ...(slices as SourceSlices<Sources>))
  }
}
