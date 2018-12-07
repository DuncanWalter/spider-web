import { Slice, createSlice } from '@dwalter/spider-store'
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

// TODO: keyed forking
export const fork = createOperation({
  fork<U, V, O>(
    this: Slice<U[], O>,
    builder: (u: Slice<U, O>) => Slice<V> = i => i as any,
  ): Slice<Slice<V, O>[], O> {
    const forkedSlices: Slice<V, O>[] = []
    const root = createSlice([this], rawForks => {
      // TODO: remove slices when forks shrinks
      return rawForks.map((_, i) => {
        if (!forkedSlices[i]) {
          forkedSlices[i] = builder(createSlice(
            [this],
            forks => (i >= forks.length ? null : forks[i]),
            rawForks[i],
          ) as Slice<U, O>) as Slice<V, O>
        }
        return forkedSlices[i]
      })
    })
    return root as Slice<Slice<V, O>[], O>
  },
} as Fork)
