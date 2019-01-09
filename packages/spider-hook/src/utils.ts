import { useState } from 'react'

import { utils } from '@dwalter/spider-store'

export const scheduleUpdate = utils.createScheduler<() => unknown, void>(
  tasks => tasks.forEach(task => task()),
)

let hash = -(2 ** 53) + 1
export function useIsFirstRender() {
  return useState(++hash)[0] === hash
}

export const noop: never = (() => {
  throw new Error('NOOP was called unexpectedly')
}) as never

export const constant: [] = []
