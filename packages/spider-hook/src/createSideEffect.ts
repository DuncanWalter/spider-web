import { Peek, SideEffect, Dispatch, Selector } from './types'

export function createSideEffect<T>(
  selector: Selector<T>,
  effect: (input: T, dispatch: Dispatch, peek: Peek) => unknown,
): SideEffect<T> {
  return { source: selector, effect, locks: new WeakMap() }
}
