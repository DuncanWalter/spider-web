import { useContext, useState } from 'react'

import { Dispatch, Action, ActionList } from '@dwalter/spider-store'

import { StoreContext } from './SpiderRoot'
import { useIsFirstRender, noop } from './utils'

interface ThunkAction<Result = unknown> {
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
  const { dispatch } = useContext(StoreContext)
  const setup = useIsFirstRender()
  const boundActions = useState(
    setup
      ? () => {
          return Object.keys(actions).reduce(
            (acc, key) => {
              acc[key] = bindAction(dispatch, actions[key] as BindableAction)
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
  dispatch: Dispatch,
  action: BindableAction,
): BoundAction<Action>

function bindAction(
  dispatch: Dispatch,
  action: Action | ActionList | Function,
) {
  if (typeof action === 'function') {
    return function() {
      return dispatch(action.apply(null, arguments))
    }
  } else {
    return () => dispatch(action)
  }
}
