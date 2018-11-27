import { useEffect, useState } from 'react'
import { Slice } from '../slice'
import { resolveSlice } from '../resolveSlice'
import { createRequester } from '../createRequester'

const requestUpdate = createRequester()

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
      const callback = (v: V) => {
        if (v !== state || !innerSlice.shallow) {
          requestUpdate(() => setState(v))
        }
      }
      innerSlice.subscribe(callback)
      return () => {
        innerSlice.unsubscribe(callback)
      }
    },
    [innerSlice],
  )
  return state
}
