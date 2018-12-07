import { Slice } from '@dwalter/spider-store'
import { createOperation } from './createOperation'

interface Thru {
  thru<U, V, O>(this: Slice<U, O>, binding: (self: Slice<U, O>) => V): V
  [ops: string]: Function
}

export const thru = createOperation<Thru>({
  thru(binding) {
    return binding(this)
  },
})
