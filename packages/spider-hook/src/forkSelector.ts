import { forkSlice } from '@dwalter/spider-store'

import { createCustomSelector } from './createCustomSelector'
import { Selector } from './types'

export function forkSelector<K, V>(
  selector: Selector<V[]>,
  getKey: (t: V, i: number) => K,
) {
  // advanced selector creator for optimizing
  // list rendering.
  return createCustomSelector([selector], slice =>
    forkSlice(slice, getKey),
  ) as Selector<[K, Selector<V>][]>
}
