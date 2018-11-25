import { Slice, SliceConfig, ValueMap, createSlice } from '../slice'
import { createOperation } from './createOperation'

// TODO: replace with joinSlices()
export const join = createOperation({
  join<U, Vs extends Slice[], V, O>(
    this: Slice<U, O>,
    slices: Vs,
    create: (v: U, ...vs: ValueMap<Vs>) => V,
    config?: SliceConfig<V>,
  ) {
    return createSlice(
      [this, ...slices],
      inputs => (create as any)(...(inputs as any[])),
      config,
    )
  },
})
