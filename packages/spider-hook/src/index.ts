import { useEffect, useState } from 'react'
import { Slice, utils } from '@dwalter/spider-store'

const { createScheduler, resolveSlice } = utils

const scheduleUpdate = createScheduler<() => unknown>(tasks =>
  tasks.forEach(task => task()),
)

export function useSlice<V extends Slice>(
  slice: V,
): V extends Slice<infer T> ? T : never

export function useSlice<V extends Slice>(
  slice: () => V,
): V extends Slice<infer T> ? T : never

export function useSlice<V extends Slice>(
  slice: V | (() => V),
): V extends Slice<infer T> ? T : never {
  const [innerSlice] = useState(slice)
  const [state, setState] = useState(() => resolveSlice(innerSlice))
  useEffect(
    () => {
      const subscription = innerSlice.subscribe((v: V) => {
        scheduleUpdate(() => setState(v))
      })
      return () => {
        innerSlice.unsubscribe(subscription)
      }
    },
    [innerSlice],
  )
  return state
}
