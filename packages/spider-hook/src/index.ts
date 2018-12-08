import { useEffect, useState } from 'react'
import { Slice, utils } from '@dwalter/spider-store'

const { createRequester, resolveSlice } = utils

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
      const subscription = innerSlice.subscribe((v: V) => {
        if (v !== state || !innerSlice.shallow) {
          requestUpdate(() => setState(v))
        }
      })
      return () => {
        innerSlice.unsubscribe(subscription)
      }
    },
    [innerSlice],
  )
  return state
}
