import { Slice, ValueMap, createSlice } from './slice'

export function joinSlices<Slices extends Slice[], V>(
  slices: Slices,
  mapping: (...values: ValueMap<Slices>) => V,
  shallow: boolean = true,
) {
  return createSlice(slices, mapping, undefined, shallow)
}
