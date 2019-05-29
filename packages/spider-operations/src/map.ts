import { Slice, utils } from '@dwalter/spider-store'
import { createOperation } from './createOperation'
import { withOperations } from './withOperations'

const { createSlice } = utils

interface Map {
  map<U, V, O>(this: Slice<U, O>, mapping: (u: U) => V): Slice<V, O>
}

export const map = createOperation<Map>({
  map(mapping) {
    return withOperations(
      createSlice([this as Slice], u => mapping(u), undefined),
      this,
    )
  },
})
