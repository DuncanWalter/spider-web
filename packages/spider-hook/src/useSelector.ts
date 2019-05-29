import { useContext, useState, useEffect } from 'react'

import { StoreContext } from './SpiderRoot'
import { noop, constant, useShouldUpdate } from './utils'
import { Selector } from './types'

/**
 * A React hook which reads state from a `Selector` or `Reducer` and
 * rerenders the component when state updates. Automatically handles
 * wrapping `Reducer`s, subscription logic, and retrieving the
 * correct store using the context api.
 * @param selector The `Selector` or `Reducer` to read state from.
 */
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
