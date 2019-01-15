import { Slice, utils, Shallow } from '@dwalter/spider-store'
import { createOperation } from './createOperation'
import { withOperations } from './utils'

const { createSlice } = utils

interface Map {
  map<U, V, O>(
    this: Slice<U, O>,
    mapping: (u: U) => V,
    shallow?: Shallow<V>,
  ): Slice<V, O>
}

export const map = createOperation<Map>({
  map(mapping, shallow = true) {
    return withOperations(
      createSlice(
        [this],
        u => mapping(u),
        undefined,
        this.shallow === false ? false : shallow,
      ),
      this,
    )
  },
})
