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
export { createStore, Dispatch, Actionable, Store } from './createStore'
export { mergeStores } from './mergeStores'
export { joinSlices } from './joinSlices'
