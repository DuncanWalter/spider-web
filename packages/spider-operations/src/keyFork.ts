import { createOperation } from './createOperation'
import { Slice, utils, Shallow } from '@dwalter/spider-store'

const { createSlice, terminateSlice } = utils

interface KeyFork {
  keyFork<K, V>(
    this: Slice<V[]>,
    getKey: (value: V, index: number) => K,
    shallow?: Shallow<V>,
  ): Slice<[K, Slice<V>][]>
}

export const keyFork = createOperation<KeyFork>({
  keyFork<K, V>(
    this: Slice<V[]>,
    getKey: (value: V, index: number) => K,
    shallow: Shallow<V> = true,
  ): Slice<[K, Slice<V>][]> {
    let lastPairs = new Map<K, [K, Slice<V>]>()
    let keyIndices = new Map<K, number>()
    let lastResult: [K, Slice<V>][] = []

    const root: Slice<[K, Slice<V>][]> = createSlice([this], values => {
      let newPairs = new Map<K, [K, Slice<V>]>()
      const newResult = values.map((value, index) => {
        const key = getKey(value, index)

        const pair = lastPairs.get(key) || [
          key,
          createSlice(
            [this, root as never],
            (values: V[]) => values[keyIndices.get(key)!] as V,
            undefined,
            shallow,
          ) as Slice<V>,
        ]

        keyIndices.set(key, index)
        lastPairs.delete(key)
        newPairs.set(key, pair)

        return pair
      })

      lastPairs.forEach(([key, value]) => {
        keyIndices.delete(key)
        terminateSlice(value)
      })

      lastPairs = newPairs

      if (contentsMatch(lastResult, newResult)) {
        return lastResult
      } else {
        lastResult = newResult
        return newResult
      }
    })
    return root
  },
})

function contentsMatch(a: unknown[], b: unknown[]) {
  if (a.length != b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
