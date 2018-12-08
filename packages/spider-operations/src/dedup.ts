import { createOperation } from './createOperation'
import { Slice, joinSlices } from '@dwalter/spider-store'

interface Dedup {
  dedup<U, O>(this: Slice<U, O>): Slice<U, O>
  [ops: string]: Function
}

function id<T>(t: T) {
  return t
}

export const dedup = createOperation<Dedup>({
  dedup(this) {
    return joinSlices([this], id)
  },
})
