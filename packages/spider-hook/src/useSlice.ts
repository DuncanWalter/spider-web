import { useEffect, useState } from 'react'
import { Slice, utils } from '@dwalter/spider-store'

const { createScheduler } = utils

const scheduleUpdate = createScheduler<() => unknown, void>(tasks =>
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
  const [state, setState] = useState(null as null | V)
  useEffect(() => {
    const subscription = innerSlice.subscribe((v: V) => {
      if (state !== null) {
        scheduleUpdate(() => setState(v))
      }
    })
    return () => {
      innerSlice.unsubscribe(subscription)
    }
  }, [])
  return state === null ? innerSlice.value : state
}
