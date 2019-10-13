import { useContext, useState, useEffect } from 'react'

import { StoreContext } from './Provider'
import { noop, constant, useShouldUpdate } from './utils'
import { Selector } from './types'

export function useSelector<T>(selector: Selector<T>): T {
  const shouldUpdate = useShouldUpdate([selector])

  const { peek, getSlice } = useContext(StoreContext)

  const [value, setValue] = useState(
    shouldUpdate ? () => peek(getSlice(selector)) : noop,
  )

  useEffect(
    shouldUpdate
      ? function() {
          const slice = getSlice(selector)
          const subscription = slice.subscribe(setValue)
          return () => slice.unsubscribe(subscription)
        }
      : noop,
    constant,
  )

  return value
}
