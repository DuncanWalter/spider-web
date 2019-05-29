import { createCustomSelector } from './createCustomSelector'
import { utils } from '@dwalter/spider-store'
import { Selector, CustomSelector } from './types'

const { createSlice } = utils

type SelectorInputs<Selectors extends Selector[]> = {
  [K in keyof Selectors]: Selectors[K] extends Selector<infer T> ? T : never
}

export function createSelector<Selectors extends Selector[], Result>(
  selectors: Selectors,
  mapping: (...args: SelectorInputs<Selectors>) => Result,
): CustomSelector<Result> {
  return createCustomSelector(selectors, (...slices) =>
    createSlice(slices, mapping as any),
  )
}
