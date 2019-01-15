import { Operation } from '.'

export function createOperation<Mixin extends {}>(
  mixin: Mixin,
): Operation<Mixin> {
  return {
    type: '@slice/operation',
    applied: false,
    operation: mixin,
  }
}
