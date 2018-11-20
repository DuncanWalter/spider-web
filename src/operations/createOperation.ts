import { Operation } from '.'

export function createOperation<
  Mixin extends { [operation: string]: Function }
>(mixin: Mixin): Operation<Mixin> {
  return {
    type: '@vertex/operation',
    applied: false,
    operation: mixin,
  }
}
