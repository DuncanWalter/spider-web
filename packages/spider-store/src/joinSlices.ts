import { Slice, createSlice, ValueMap } from './slice'

export function joinSlices<T, ParentSlices extends Slice[]>(
  mapping: (...args: ValueMap<ParentSlices>) => T,
  ...slices: ParentSlices
) {
  if (!slices.length) {
    throw new Error()
  }
  return createSlice(slices[0].network, slices, mapping)
}
