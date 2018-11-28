import { createOperation } from './createOperation'
import { Slice, createSlice } from '../slice'

interface Dedup {
  dedup<U, O>(this: Slice<U, O>): Slice<U, O>
  [ops: string]: Function
}

function id<T>(t: T) {
  return t
}

export const dedup = createOperation<Dedup>({
  dedup(this) {
    return createSlice([this], id)
  },
})
