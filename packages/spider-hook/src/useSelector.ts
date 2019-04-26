import { useContext, useState, useEffect, useRef } from 'react'

import { StoreContext } from './SpiderRoot'
import { Source } from './types'
import { useIsFirstRender, noop, constant } from './utils'

/**
 * A React hook which reads state from a `Selector` or `Reducer` and
 * rerenders the component when state updates. Automatically handles
 * wrapping `Reducer`s, subscription logic, and retrieving the
 * correct store using the context api.
 * @param selector The `Selector` or `Reducer` to read state from.
 */
export function useSelector<T>(selector: Source<T>): T {
  const setup = useIsFirstRender()

  const { resolve, getSlice } = useContext(StoreContext)

  const { current: slice } = useRef(setup ? getSlice<T>(selector) : noop)

  const [value, setValue] = useState(setup ? () => resolve(slice) : noop)

  useEffect(
    setup
      ? () => {
          const subscription = slice.subscribe(setValue)
          return () => slice.unsubscribe(subscription)
        }
      : noop,
    constant,
  )

  return value
}
