import { Slice, utils } from '@dwalter/spider-store'

import { createOperation } from './createOperation'
import { withOperations } from './utils'

const { createSlice } = utils

interface Dedup {
  dedup<This extends Slice>(this: This): This
}

function id<T>(t: T) {
  return t
}

export const dedup = createOperation<Dedup>({
  dedup(this) {
    return withOperations(createSlice([this], id), this)
  },
})
