import { OperationCluster, OperationSet } from '.'

export function joinOperations<Os extends OperationSet[]>(
  ...operationSets: Os
): OperationCluster<
  {
    [I in keyof Os]: Os[I] extends OperationCluster<infer C> ? C[number] : Os[I]
  }[number][]
> {
  const operations = new Set()
  for (let set of operationSets) {
    if (set.type === '@vertex/operation') {
      operations.add(set)
    } else {
      for (let op of set.operations) {
        operations.add(set)
      }
    }
  }
  return {
    type: '@vertex/operation-cluster',
    applied: false,
    operations: [...operations] as any,
  }
}
