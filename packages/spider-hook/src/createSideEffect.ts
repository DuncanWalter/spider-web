import { Resolve, SideEffect, Dispatch, Selector } from './types'

/**
 * Creates a `SideEffect` which runs a callback whenever the value
 * of a `Selector` (or `Reducer`) changes. The callback is also passed
 * `dispatch()`. `SideEffects` can be
 * consumed in components via the hook `useSideEffect()`. There is currently
 * no way to consume a `SideEffect` outside of a component.
 * @param selector the `Selector` or `Reducer`to watch for changes
 * @param effect a callback which is run whenever the selector's
 * value updates.
 */
export function createSideEffect<T>(
  selector: Selector<T>,
  effect: (input: T, dispatch: Dispatch, resolve: Resolve) => unknown,
): SideEffect<T> {
  return { source: selector, effect, locks: new WeakMap() }
}
