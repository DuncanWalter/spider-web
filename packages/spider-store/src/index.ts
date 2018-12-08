import { getMaster } from './createStore'
import { createRequester } from './createRequester'
import { createSlice } from './slice'
import { resolveSlice } from './resolveSlice'

export const utils = {
  getMaster,
  createRequester,
  createSlice,
  resolveSlice,
}

export { Slice } from './slice'
export { createStore } from './createStore'
export { mergeStores } from './mergeStores'
export { joinSlices } from './joinSlices'
