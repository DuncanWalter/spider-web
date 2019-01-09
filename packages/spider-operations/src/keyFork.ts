import { createOperation } from './createOperation'
import { Slice, utils } from '@dwalter/spider-store'

const { createSlice } = utils

interface KeyFork {
  keyFork<K, V>(
    this: Slice<V[]>,
    getKey: (value: V, index: number) => K,
    shallow?: boolean,
  ): Slice<{ key: K; value: Slice<V> }[]>
  [ops: string]: Function
}

export const keyFork = createOperation<KeyFork>({
  keyFork<K, V>(
    this: Slice<V[]>,
    getKey: (value: V, index: number) => K,
    shallow: boolean = true,
  ): Slice<{ key: K; value: Slice<V> }[]> {
    const sliceMap = new Map<K, Slice<V>>()
    const indexMap = new Map<K, number>()

    const root = createSlice([this], values => {
      if (sliceMap.size > 2 * values.length) {
        const keys = new Set()
        values.map(getKey).forEach(key => keys.add(key))
        sliceMap.forEach((_, key) => {
          if (keys.has(key)) {
            sliceMap.delete(key)
            indexMap.delete(key)
          }
        })
      }
      return values.map((value, index) => {
        const key = getKey(value, index)
        indexMap.set(key, index)
        sliceMap.set(
          key,
          sliceMap.get(key) ||
            createSlice(
              [this, root],
              values => {
                return values[indexMap.get(key)!]
              },
              undefined,
              shallow,
            ),
        )
        return { key, value: sliceMap.get(key)! }
      })
    })
    return root
  },
})
