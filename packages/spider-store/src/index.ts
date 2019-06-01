import { createSlice, isSlice } from './slice'
import { isFunction } from './isFunction'
import { SwapSet } from './SwapSet'
import { createNetwork } from './createNetwork'
import { resolveSlice } from './resolveSlice'

export const utils = {
  createSlice,
  isSlice,
  isFunction,
  SwapSet,
  resolveSlice,
  createNetwork,
}

export { Slice } from './slice'

export { createStore } from './createStore'

export { joinSlices } from './joinSlices'

export { forkSlice } from './forkSlice'

export { Subscription } from './SwapSet'

export * from './types'
