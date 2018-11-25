import { Slice } from '../slice'
import { createOperation } from './createOperation'

export const thru = createOperation({
  thru<U, V, O>(this: Slice<U, O>, binding: (self: Slice<U, O>) => V): V {
    return binding(this)
  },
})
