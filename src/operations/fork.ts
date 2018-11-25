import { Slice, createSlice } from '../slice'
import { createOperation } from './createOperation'

type Prong<S> = S extends Slice<Array<infer U>, infer O> ? Slice<U, O> : never

interface Fork {
  fork<U extends Slice<any[]>, O>(this: U): Slice<Prong<U>[], O>
  fork<U extends Slice<any[]>, V, O>(
    this: U,
    builder: (prong: Prong<U>) => V,
  ): Slice<V[], O>
  [ops: string]: Function
}

export const fork = createOperation({
  fork<U, V, O>(
    this: Slice<U[], O>,
    builder: (u: Slice<U, O>) => Slice<V> = i => i as any,
  ): Slice<Slice<V, O>[], O> {
    const forkedSlices: Slice<V>[] = []
    let forks: U[]
    const root = createSlice([this], ([rawForks]) => {
      forks = rawForks
      // TODO: remove slices when forks shrinks
      return forks.map((_, i) => {
        if (!forkedSlices[i]) {
          forkedSlices[i] = builder(createSlice<any, U>(
            [root],
            _ => (i >= forks.length ? null : forks[i]),
            { initialValue: forks[i] },
          ) as Slice<U, O>)
        }
        return forkedSlices[i]
      })
    })
    return root as Slice<Slice<V, O>[], O>
  },
} as Fork)
