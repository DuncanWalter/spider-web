import { Slice } from '@dwalter/spider-store'

export function withOperations<V, O>(
  slice: Slice<V, any>,
  operations: Slice<any, O>,
): Slice<V, O> {
  return slice
}
