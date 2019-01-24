import { useState } from 'react'

import { utils } from '@dwalter/spider-store'

type UpdatePair<T> = [(t: T) => unknown, T]

// TODO: remove because there is really no point-
// this is handled both above and below
export const scheduleUpdate = utils.createScheduler<UpdatePair<unknown>, void>(
  tasks => {
    for (let [setState, value] of tasks) {
      setState(value)
    }
  },
)

let hash = -(2 ** 53) + 1
export function useIsFirstRender() {
  return useState(++hash)[0] === hash
}

export const noop: never = (() => {
  throw new Error('NOOP was called unexpectedly')
}) as never

export const constant: [] = []
