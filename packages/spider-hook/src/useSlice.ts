import { useEffect, useState } from 'react'
import { Slice, utils } from '@dwalter/spider-store'

const { createScheduler } = utils

const scheduleUpdate = createScheduler<() => unknown, void>(tasks =>
  tasks.forEach(task => task()),
)

export function useSlice<V>(slice: Slice<V>): V

export function useSlice<V>(slice: () => Slice<V>): V

export function useSlice<V>(slice: Slice<V> | (() => Slice<V>)): V {
  const [innerSlice]: [Slice<V>, unknown] = useState(slice)
  let state
  let setState: (v: V) => unknown = () => {}
  useEffect(
    () => {
      const subscription = innerSlice.subscribe((v: V) => {
        const exec = setState
        scheduleUpdate(() => exec(v))
      })
      return () => {
        innerSlice.unsubscribe(subscription)
      }
    },
    [innerSlice],
  )
  ;[state, setState] = useState(innerSlice.value)
  return state
}
