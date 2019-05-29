import { useContext, useState, useEffect } from 'react'

import { StoreContext } from './SpiderRoot'
import { noop, constant, useShouldUpdate } from './utils'
import { Selector } from './types'

export function useSelector<T>(selector: Selector<T>): T {
  const shouldUpdate = useShouldUpdate([selector])

  const { resolve, getSlice } = useContext(StoreContext)

  const slice = shouldUpdate ? getSlice<T>(selector) : noop

  const [value, setValue] = useState(shouldUpdate ? () => resolve(slice) : noop)

  useEffect(
    shouldUpdate
      ? function() {
          const subscription = slice.subscribe(setValue)
          return () => slice.unsubscribe(subscription)
        }
      : noop,
    constant,
  )

  return value
}
