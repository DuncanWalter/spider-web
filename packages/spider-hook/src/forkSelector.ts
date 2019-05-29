import { keyFork } from '@dwalter/spider-operations'

import { createCustomSelector } from './createCustomSelector'
import { Selector } from './types'

export function forkSelector<K, V>(
  selector: Selector<V[]>,
  getKey: (t: V, i: number) => K,
) {
  return createCustomSelector([selector], slice =>
    slice.use(keyFork).keyFork(getKey),
  ) as Selector<[K, Selector<V>][]>
}
