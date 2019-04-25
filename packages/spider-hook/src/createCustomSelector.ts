import { Slice } from '@dwalter/spider-store'
import { Source, Selector } from './types'

type SourceSlices<Sources extends Source[]> = {
  [K in keyof Sources]: Sources[K] extends Source<infer T> ? Slice<T> : never
}

export function createCustomSelector<Sources extends Source[], Result>(
  sources: Sources,
  mapping: (...slices: SourceSlices<Sources>) => Slice<Result>,
): Selector<Result> {
  return { sources, mapping }
}
