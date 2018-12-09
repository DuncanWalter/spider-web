import { Slice, ValueMap, createSlice } from './slice'

const single: (...args: any[]) => any = a => [a]
const double: (...args: any[]) => any = (a, b) => [a, b]
const triple: (...args: any[]) => any = (a, b, c) => [a, b, c]
const variadic: (...args: any[]) => any = (...args) => args

export function joinSlices<Slices extends Slice[]>(
  ...slices: Slices
): Slice<ValueMap<Slices>> {
  switch (slices.length) {
    case 1:
      return createSlice(slices, single)
    case 2:
      return createSlice(slices, double)
    case 3:
      return createSlice(slices, triple)
    default:
      return createSlice(slices, variadic)
  }
}
