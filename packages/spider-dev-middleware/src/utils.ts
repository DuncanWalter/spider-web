import { Reducer, RawStore } from '@dwalter/spider-store'

export function injectState(
  store: RawStore,
  state: { [props: string]: unknown },
) {
  store.slices.forEach((slice: any, reducer: Reducer<any>) => {
    slice.setState(state[reducer.name])
  })
  store.network.propagate()
}

export function aggregateState(store: RawStore) {
  const state: { [props: string]: unknown } = {}
  store.slices.forEach((slice: any, reducer: Reducer<any>) => {
    state[reducer.name] = store.peek(slice)
  })
  return state
}

export function throttle<F extends (...args: any[]) => void>(
  fn: F,
  ms: number,
): F {
  let lastCalled = 0
  let timeout: number

  function exec(that: any, args: any[]) {
    lastCalled = Date.now()
    fn.apply(that, args)
  }

  return function throttled(this: any, ...args: any[]) {
    clearTimeout(timeout)
    const now = Date.now()
    const nextCallDelay = lastCalled + ms - now
    if (nextCallDelay <= 0) {
      exec(this, args)
    } else {
      timeout = setTimeout(exec, nextCallDelay, this, args)
    }
  } as F
}
