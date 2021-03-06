export { createSelector } from './createSelector'
export { createSideEffect } from './createSideEffect'
export { forkSelector } from './forkSelector'
export { Provider } from './Provider'
export { useDispatch } from './useDispatch'
export { useSelector } from './useSelector'
export { useSideEffect } from './useSideEffect'
export { useShouldUpdate } from './utils'

export * from './types'

export {
  Action,
  ActionList,
  Reducer,
  Dispatch,
  Slice,
} from '@dwalter/spider-store'

import { utils as storeUtils, createStore } from '@dwalter/spider-store'
import { createCustomSelector } from './createCustomSelector'
import { useStore } from './useStore'
import { StoreContext } from './Provider'

/**
 * powerful utils are provided for tinkering,
 * but generally shouldn't be used directly.
 */
export const utils = {
  ...storeUtils,
  createCustomSelector,
  useStore,
  StoreContext,
  createStore,
}
