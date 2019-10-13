import { Slice } from '@dwalter/spider-store'
import { Selector, CustomSelector } from './types'

type SourceSlices<Sources extends Selector[]> = {
  [K in keyof Sources]: Sources[K] extends Selector<infer T> ? Slice<T> : never
}

export function createCustomSelector<Sources extends Selector[], Result>(
  mapping: (...slices: SourceSlices<Sources>) => Slice<Result>,
  sources: Sources,
): CustomSelector<Result> {
  return { sources, mapping }
}
