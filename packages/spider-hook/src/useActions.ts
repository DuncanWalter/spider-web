import { useContext, useState } from 'react'

import {
  Dispatch,
  Action,
  ActionList,
  Store,
  Reducer,
  Resolve as StoreResolve,
} from '@dwalter/spider-store'

import { StoreContext } from './SpiderRoot'
import { useIsFirstRender, noop } from './utils'
import { Selector } from './useSelector'
import { getSlice } from './getSlice'

interface Resolve {
  <V>(wrapper: Reducer<V> | Selector<V>): V
}

export interface ThunkAction<Result = any> {
  (dispatch: Dispatch, resolve: Resolve): Result
}

export interface ActionCreator<Args extends any[] = any[]> {
  (...args: Args): Action | ActionList
}

export interface ActionScheduler<Args extends any[] = any[], Result = any> {
  (...args: Args): ThunkAction<Result>
}

export type BindableAction =
  | Action
  | ActionList
  | ActionCreator
  | ActionScheduler

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

export function wrapThunk<Result>(thunk: ThunkAction<Result>) {
  return (dispatch: Dispatch, resolve: StoreResolve) =>
    thunk(dispatch, wrapper => resolve(getSlice(dispatch, wrapper)))
}

function bindAction<Action extends BindableAction>(
  store: Store,
  action: BindableAction,
): BoundAction<Action>

function bindAction(store: Store, actionable: Action | ActionList | Function) {
  const { dispatch } = store
  if (typeof actionable == 'function') {
    return function() {
      const action: Action | ActionList | ThunkAction = actionable.apply(
        null,
        arguments,
      )
      if (typeof action == 'function') {
        return dispatch(wrapThunk(action))
      } else {
        dispatch(action)
      }
    }
  } else {
    return () => dispatch(actionable)
  }
}
