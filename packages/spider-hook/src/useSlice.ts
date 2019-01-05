import { useEffect, useState } from 'react'
import { Slice, utils } from '@dwalter/spider-store'

const { createScheduler } = utils

const scheduleUpdate = createScheduler<() => unknown, void>(tasks => {
  tasks.forEach(task => task())
})

function noop() {}

export function useSlice<V>(slice: Slice<V>): V

export function useSlice<V>(slice: () => Slice<V>): V

// NOTE: This assumes the slice being watched never changes
// (could be a problem with forking)
export function useSlice<V>(slice: Slice<V> | (() => Slice<V>)): V {
  const [innerSlice]: [Slice<V>, unknown] = useState(slice)
  let subscription: null | number = null
  const [state, setState] = useState(() => {
    subscription = innerSlice.subscribe(v => {
      if (setState) {
        scheduleUpdate(() => setState(v))
      }
    })
    return innerSlice.value
  })
  useEffect(
    subscription === null
      ? noop
      : () => () => innerSlice.unsubscribe(subscription as number),
    [],
  )
  return state
}
