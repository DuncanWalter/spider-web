import { Operation, OperationCluster } from '.'

export function joinOperations<Ops extends Operation<any>[]>(
  ...operations: Ops
): OperationCluster<Ops> {
  return {
    type: '@slice/operation-cluster',
    applied: false,
    operations,
  }
}
