export {
  useActions,
  ThunkAction,
  ActionCreator,
  ActionScheduler,
  BindableAction,
  Resolve,
} from './useActions'

export { useSelector } from './useSelector'
export { createSelector } from './createSelector'
export { SpiderRoot } from './SpiderRoot'
export { useSideEffect, createSideEffect } from './useSideEffect'
export { Fork } from './Fork'
export { tuple } from './utils'

export {
  Action,
  ActionList,
  Reducer,
  Dispatch,
  Slice,
  Store,
} from '@dwalter/spider-store'

import { utils as storeUtils, createStore } from '@dwalter/spider-store'
import { createCustomSelector } from './createCustomSelector'
import { useStore } from './useStore'
import { wrapThunk } from './useActions'
import { StoreContext } from './SpiderRoot'
import { useIsFirstRender } from './utils'

/**
 * powerful utils are provided for tinkering,
 * but generally shouldn't be used directly.
 */
export const utils = {
  ...storeUtils,
  createCustomSelector,
  useStore,
  wrapThunk,
  StoreContext,
  createStore,
  useIsFirstRender,
}
