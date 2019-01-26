import { createSlice } from './slice'
import { propagateSlices } from './propagateSlices'

export const utils = {
  createSlice,
  propagateSlices,
}

export { Shallow, Slice } from './slice'

export {
  Action,
  ActionList,
  createStore,
  Dispatch,
  Reducer,
  Store,
} from './createStore'

export { createSettableState } from './createSettableState'
export { joinSlices } from './joinSlices'
