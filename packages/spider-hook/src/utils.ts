import { useState } from 'react'

let hash = -(2 ** 53) + 1
export function useIsFirstRender() {
  return useState(++hash)[0] === hash
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
      if (--semaphore) {
        callback()
        callback = noop
      }
    }
  }
}
