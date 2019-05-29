import { Slice } from '@dwalter/spider-store'
import { Selector, CustomSelector } from './types'

type SourceSlices<Sources extends Selector[]> = {
  [K in keyof Sources]: Sources[K] extends Selector<infer T> ? Slice<T> : never
}

export function createCustomSelector<Sources extends Selector[], Result>(
  sources: Sources,
  mapping: (...slices: SourceSlices<Sources>) => Slice<Result>,
): CustomSelector<Result> {
  return { sources, mapping }
}
