import { OperationCluster, Operation } from '@dwalter/spider-store'

export function joinOperations<Ops extends Operation<any>[]>(
  ...operations: Ops
): OperationCluster<Ops> {
  return {
    type: '@slice/operation-cluster',
    applied: false,
    operations,
  }
}
