import { useRef } from 'react'

export function useShouldUpdate(deps?: unknown[]) {
  const depsRef = useRef<unknown[]>()
  const { current } = depsRef

  if (!current) {
    depsRef.current = deps || []
    return true
  }

  if (deps) {
    if (deps.length != current.length) {
      depsRef.current = deps
      return true
    }
    for (let i = 0; i < deps.length; i++) {
      if (deps[i] !== current[i]) {
        depsRef.current = deps
        return true
      }
    }
  }

  return false
}

export const noop: never = (() => {
  throw new Error('NOOP was called unexpectedly')
}) as never

export const constant: [] = []

/**
 * Used to construct selectors because the first argument is
 * an array and will not be properly interpreted as a tuple
 * by default.
 */
export function tuple<Args extends any[]>(...args: Args): Args {
  return args
}

export function semaphore(fun: () => () => void): () => () => void {
  let semaphore = 0
  let callback: () => void = noop
  return () => {
    if (!semaphore++) {
      callback = fun()
    }
    return () => {
      if (!--semaphore) {
        callback()
        callback = noop
      }
    }
  }
}
