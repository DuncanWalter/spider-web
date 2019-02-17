import { createSlice, isSlice } from './slice'
import { isFunction } from './isFunction'

export const utils = { createSlice, isSlice, isFunction }

export {
  Shallow,
  Slice,
  Operation,
  OperationCluster,
  OperationSet,
} from './slice'

export {
  Action,
  ActionList,
  createStore,
  Dispatch,
  Resolve,
  Reducer,
  Store,
} from './createStore'

export { joinSlices } from './joinSlices'

export { Subscription } from './SliceSet'
