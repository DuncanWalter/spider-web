import { useRef } from 'react'

export function useShouldUpdate(deps?: unknown[]) {
  // Effectively serves the same purpose as deps
  // arguments in many React hooks. used to prevent
  // callbacks which will never be called from
  // being created.
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

export function semaphore(fun: () => () => void): () => () => void {
  // Prevents pub-sub objects from forming multiple of the same
  // subscription.
  let semaphoreValue = 0
  let callback: () => void = noop
  return () => {
    if (!semaphoreValue++) {
      callback = fun()
    }
    return () => {
      if (!--semaphoreValue) {
        callback()
        callback = noop
      }
    }
  }
}
