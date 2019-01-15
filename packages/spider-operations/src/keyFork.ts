import { createOperation } from './createOperation'
import { Slice, utils, Shallow } from '@dwalter/spider-store'

const { createSlice } = utils

interface KeyFork {
  keyFork<K, V>(
    this: Slice<V[]>,
    getKey: (value: V, index: number) => K,
    shallow?: Shallow<V>,
  ): Slice<{ key: K; value: Slice<V> }[]>
}

export const keyFork = createOperation<KeyFork>({
  keyFork<K, V>(
    this: Slice<V[]>,
    getKey: (value: V, index: number) => K,
    shallow: Shallow<V> = true,
  ): Slice<{ key: K; value: Slice<V> }[]> {
    const sliceMap = new Map<K, Slice<V>>()
    const indexMap = new Map<K, number>()
    let lastValue: { key: K; value: Slice<V> }[] = []

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

      let mutated = values.length === lastValue.length ? false : true
      let result = mutated ? [] : lastValue

      values.forEach((value, index) => {
        const key = getKey(value, index)
        const slice =
          sliceMap.get(key) ||
          createSlice(
            [this, root],
            values => values[indexMap.get(key)!] as V,
            undefined,
            shallow,
          )
        if (mutated) {
          indexMap.set(key, index)
          sliceMap.set(key, slice)
          result.push({ key, value: slice })
        } else {
          let pair = result[index]
          if (pair.key !== key || pair.value !== slice) {
            mutated = true
            result = result.slice(0, index)
            result.push({ key, value: slice })
          }
        }
      })

      lastValue = result
      return result
    })
    return root
  },
})
