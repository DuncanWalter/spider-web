import { useContext, useState, useEffect } from 'react'

import { getSlice } from './getSlice'
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
  const store = useContext(StoreContext)
  const slice = useState(
    setup ? getSlice<T>(store.dispatch, selector) : noop,
  )[0]

  const [value, setValue] = useState(setup ? () => store.resolve(slice) : noop)

  useEffect(
    setup
      ? () => {
          const subscription = slice.subscribe(setValue)
          return () => {
            slice.unsubscribe(subscription)
          }
        }
      : noop,
    constant,
  )

  return value
}
