import { createCustomSelector } from './createCustomSelector'
import { Shallow } from '@dwalter/spider-store'
import { utils } from '@dwalter/spider-store'
import { Source, Selector } from './types'

const { createSlice } = utils

type SourceInputs<Sources extends Source[]> = {
  [K in keyof Sources]: Sources[K] extends Source<infer T> ? T : never
}

export function createSelector<Sources extends Source[], Result>(
  sources: Sources,
  mapping: (...args: SourceInputs<Sources>) => Result,
  shallow: Shallow<Result> = true,
): Selector<Result> {
  return createCustomSelector(sources, (...slices) =>
    createSlice(slices, mapping as any, undefined, shallow),
  )
}
