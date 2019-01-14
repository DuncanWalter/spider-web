import { Slice } from '@dwalter/spider-store'

export function withOperations<V, X, O>(
  slice: Slice<V, any>,
  operations: Slice<X, O>,
): Slice<V, O> {
  return slice
}
