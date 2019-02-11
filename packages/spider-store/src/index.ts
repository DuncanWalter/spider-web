import { createSlice, isSlice } from './slice'

export const utils = { createSlice, isSlice }

export { Shallow, Slice } from './slice'

export {
  Action,
  ActionList,
  createStore,
  Dispatch,
  Resolve,
  Reducer,
  Store,
} from './createStore'

export { createSettableState } from './createSettableState'
export { joinSlices } from './joinSlices'

export { Subscription } from './SliceSet'
