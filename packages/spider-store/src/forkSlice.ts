import { Slice, createSlice } from './slice'

function contentsMatch(a: unknown[], b: unknown[]) {
  if (a.length != b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function forkSlice<K, V>(
  slice: Slice<V[]>,
  getKey: (value: V, index: number) => K,
): Slice<[K, Slice<V>][]> {
  const pairs = new Map<K, [K, Slice<V>]>()
  const keyIndices = new Map<K, number>()
  let rawValues: V[] = []
  let lastResult: [K, Slice<V>][] = []

  const root: Slice<[K, Slice<V>][]> = createSlice(
    slice.network,
    [slice],
    values => {
      rawValues = values

      const newResult = values.map((value, index) => {
        const key = getKey(value, index)

        let pair = pairs.get(key)

        if (!pair) {
          pair = [
            key,
            createSlice(
              slice.network,
              [],
              () => rawValues[keyIndices.get(key)!] as V,
              undefined,
            ) as Slice<V>,
          ]
          pairs.set(key, pair)
        }

        keyIndices.set(key, index)

        return pair
      })

      if (pairs.size > 2 * values.length) {
        // clean out any pairs that are no longer
        // being used whenever over half of them
        // are dead
        const current = new Set<K>()
        for (let i = 0; i < values.length; i++) {
          current.add(getKey(values[i], i))
        }
        pairs.forEach((_, key) => {
          if (!current.has(key)) pairs.delete(key)
        })
      }

      for (const [, child] of newResult) {
        child.push()
      }

      if (contentsMatch(lastResult, newResult)) {
        return lastResult
      } else {
        lastResult = newResult
        return newResult
      }
    },
  )
  return root
}
