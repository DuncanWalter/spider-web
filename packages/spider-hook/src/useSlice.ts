import { useEffect, useState } from 'react'

import { Slice } from '@dwalter/spider-store'

import { scheduleUpdate, useIsFirstRender, noop, constant } from './utils'
import { StoreContextContent } from './SpiderRoot'
import { Source, deleteSlice } from './useStoreState'

export function useSlice<T>(
  store: StoreContextContent,
  source: Source<any>,
  slice: Slice<T>,
) {
  const setup = useIsFirstRender()
  let subscription: number = -1

  if (setup && typeof source !== 'function') {
    source.targets += 1
  }

  const [state, setState] = useState(
    setup
      ? () => {
          subscription = slice.subscribe(v => {
            if (setState) {
              scheduleUpdate(() => setState(v))
            }
          })
          return slice.value
        }
      : noop,
  )
  useEffect(
    setup
      ? () => () => {
          slice.unsubscribe(subscription as number)
          if (typeof source !== 'function') {
            source.targets -= 1
            if (!source.targets) {
              deleteSlice(store, source)
            }
          }
        }
      : noop,
    constant,
  )
  return state
}
