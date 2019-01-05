import { Slice } from '.'
import { createSlice } from './slice'

type SliceMap = {
  [key: string]: Slice<any>
}

type ValueMap<Slices extends SliceMap> = {
  [K in keyof Slices]: Slices[K] extends Slice<infer V> ? V : never
}

export function mergeSlices<Slices extends SliceMap, Result>(
  slices: Slices,
  mapping: (values: ValueMap<Slices>) => Result,
  shallow: boolean = true,
): Slice<Result> {
  const keys = Object.keys(slices)

  return createSlice(
    keys.map(key => slices[key]),
    function(): Result {
      const values: any = {}
      for (let i = 0; i < keys.length; i++) {
        values[keys[i]] = arguments[i]
      }
      return mapping(values)
    },
    undefined,
    shallow,
  )
}
