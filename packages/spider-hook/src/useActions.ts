// import { useContext, useRef } from 'react'

// import { Action, ActionList } from '@dwalter/spider-store'

// import { StoreContext } from './SpiderRoot'
// import { useShouldUpdate, noop } from './utils'
// import {
//   Store,
//   BindableAction,
//   ActionCreator,
//   ActionScheduler,
//   ThunkAction,
// } from './types'

// type BoundAction<A extends BindableAction> = A extends Action
//   ? () => void
//   : A extends ActionCreator<infer Args>
//   ? (...args: Args) => void
//   : A extends ActionScheduler<infer Args, infer Result>
//   ? (...args: Args) => Result
//   : never

// interface BindableActionMap {
//   [key: string]: BindableAction
// }

// type BoundActionMap<Actions extends BindableActionMap> = {
//   [K in keyof Actions]: BoundAction<Actions[K]>
// }

// /**
//  * `useActions()` is a hook which binds actions to the store dispatch function.
//  * The actions are passed as a map from action name to action, and
//  * `useActions()` returns a map from action name to bound action. A bound action
//  * is dispatched when called.
//  */
// export function useActions<Actions extends BindableActionMap>(
//   actions: Actions,
// ): BoundActionMap<Actions> {
//   const shouldUpdate = useShouldUpdate()
//   const store = useContext(StoreContext)
//   const { current: boundActions } = useRef(
//     shouldUpdate
//       ? Object.keys(actions).reduce(
//           (acc, key) => {
//             acc[key] = bindAction(store, actions[key] as BindableAction)
//             return acc
//           },
//           {} as BoundActionMap<Actions>,
//         )
//       : noop,
//   )
//   return boundActions
// }

// function bindAction<Action extends BindableAction>(
//   store: Store,
//   action: BindableAction,
// ): BoundAction<Action>

// function bindAction(
//   { dispatch, resolve, getSlice }: Store,
//   actionable: Action | ActionList | Function,
// ) {
//   if (typeof actionable == 'function') {
//     return function() {
//       const action: Action | ActionList | ThunkAction = actionable.apply(
//         null,
//         arguments,
//       )
//       if (typeof action == 'function') {
//         return action(dispatch, source => resolve(getSlice(source)))
//       } else {
//         dispatch(action)
//       }
//     }
//   } else {
//     return () => dispatch(actionable)
//   }
// }
