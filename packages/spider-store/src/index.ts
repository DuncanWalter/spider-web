import { createSlice, isSlice } from './slice'
import { isFunction } from './isFunction'
import { SliceSet } from './sliceSet'
import { propagateSlices } from './propagateSlices'
import { resolveSlice } from './resolveSlice'
import { terminateSlice } from './terminateSlice'

export const utils = {
  createSlice,
  isSlice,
  isFunction,
  SliceSet,
  propagateSlices,
  resolveSlice,
  terminateSlice,
}

export { Slice } from './slice'

export { createStore } from './createStore'

export { joinSlices } from './joinSlices'

export { Subscription } from './sliceSet'

export * from './types'
