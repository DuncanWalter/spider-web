import { createScheduler } from './createScheduler'
import { createSlice } from './slice'
import { resolveSlice } from './resolveSlice'
import { propagateSlices } from './propagateSlices'

export const utils = {
  createScheduler,
  createSlice,
  resolveSlice,
  propagateSlices,
}

export { Slice, Shallow } from './slice'
export { createStore, Dispatch, Reducer, Action, Store } from './createStore'
export { createSettableState } from './createSettableState'
export { joinSlices } from './joinSlices'
export { mergeSlices } from './mergeSlices'
