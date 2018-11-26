import { Slice } from '../slice'
import { createOperation } from './createOperation'

interface Thru {
  thru<U, V, O>(this: Slice<U, O>, binding: (self: Slice<U, O>) => V): V
  [ops: string]: Function
}

export const thru = createOperation({
  thru<U, V, O>(this: Slice<U, O>, binding: (self: Slice<U, O>) => V): V {
    return binding(this)
  },
} as Thru)
