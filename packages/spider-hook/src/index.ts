export {
  useActions,
  ThunkAction,
  ActionCreator,
  ActionScheduler,
  BindableAction,
  Resolve,
} from './useActions'
export { useSelector, createSelector } from './useSelector'
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

// powerful utils are provided for tinkering,
// but generally shouldn't be used directly.

import { utils as storeUtils } from '@dwalter/spider-store'
import { createCustomSelector } from './useSelector'
import { useStore } from './useStore'
import { wrapThunk } from './useActions'

export const utils = {
  ...storeUtils,
  createCustomSelector,
  useStore,
  wrapThunk,
}
