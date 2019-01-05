import { getMaster } from './createStore'
import { createScheduler } from './createScheduler'
import { createSlice } from './slice'
import { resolveSlice } from './resolveSlice'

export const utils = {
  getMaster,
  createScheduler,
  createSlice,
  resolveSlice,
}

export { Slice } from './slice'
export { createStore, Dispatch, Reducer, Action, Store } from './createStore'
export { createSettableState } from './createSettableState'
export { joinSlices } from './joinSlices'
export { mergeSlices } from './mergeSlices'
