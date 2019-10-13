import { createCustomSelector } from './createCustomSelector'
import { utils } from '@dwalter/spider-store'
import { Selector, CustomSelector } from './types'

const { createSlice } = utils

type SelectorInputs<Selectors extends Selector[]> = {
  [K in keyof Selectors]: Selectors[K] extends Selector<infer T> ? T : never
}

export function createSelector<Selectors extends Selector[], Result>(
  mapping: (...args: SelectorInputs<Selectors>) => Result,
  ...selectors: Selectors
): CustomSelector<Result> {
  return createCustomSelector((...slices) => {
    if (!slices.length) {
      throw new Error()
    }

    return createSlice(slices[0].network, slices, mapping as any)
  }, selectors)
}
