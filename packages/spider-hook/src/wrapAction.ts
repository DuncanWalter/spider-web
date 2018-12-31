import { createContext, useContext } from 'react'
import { Dispatch, Action } from '@dwalter/spider-store'

export const DispatchContext = createContext<Dispatch>(() => {
  throw new Error(
    'DispatchContext referenced from outside the context of a SpiderRoot',
  )
})

interface ThunkAction<Result = unknown> {
  (dispatch: Dispatch): Result
}

interface ActionCreator<Args extends any[]> {
  (...args: Args): Action
}

interface ActionScheduler<Args extends any[], Result> {
  (...args: Args): ThunkAction<Result>
}

export function wrapAction(action: Action): () => () => void

export function wrapAction<Args extends any[]>(
  actionCreator: ActionCreator<Args>,
): () => (...args: Args) => void

export function wrapAction<Args extends any[], Result>(
  actionCreator: ActionScheduler<Args, Result>,
): () => (...args: Args) => Result

// export function useAction(action: Action | Function) {
//   const dispatch = useContext(DispatchContext)
//   if (typeof action === 'function') {
//     return (...args: unknown[]) => dispatch(action(args))
//   } else {
//     return () => dispatch(action)
//   }
// }

export function wrapAction(action: Action | Function) {
  return function useAction() {
    const dispatch = useContext(DispatchContext)
    if (typeof action === 'function') {
      return (...args: unknown[]) => dispatch(action(args))
    } else {
      return () => dispatch(action)
    }
  }
}
