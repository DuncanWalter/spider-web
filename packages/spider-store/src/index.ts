import { createSlice, isSlice } from './slice'
import { isFunction } from './isFunction'
import { SwapSet } from './SwapSet'
import { createNetwork } from './createNetwork'
import { peekSlice } from './peekSlice'

export const utils = {
  createSlice,
  isSlice,
  isFunction,
  SwapSet,
  peekSlice,
  createNetwork,
}

export { Slice } from './slice'

export { createStore } from './createStore'

export { joinSlices } from './joinSlices'

export { forkSlice } from './forkSlice'

export { Subscription } from './SwapSet'

export * from './types'
