import { Slice, joinSlices } from '@dwalter/spider-store'
import { createOperation } from './createOperation'

interface Map {
  map<U, V, O>(this: Slice<U, O>, mapping: (u: U) => V): Slice<V, O>
  [ops: string]: Function
}

export const map = createOperation<Map>({
  map(mapping) {
    return joinSlices([this], u => mapping(u))
  },
})
