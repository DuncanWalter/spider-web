import * as React from 'react'
import { useContext, useState, memo } from 'react'

import { Slice } from '@dwalter/spider-store'
import { keyFork } from '@dwalter/spider-operations'

import { useIsFirstRender, noop } from './utils'
import { Source, getSlice } from './useStoreState'
import { useSlice } from './useSlice'
import { StoreContext } from './SpiderRoot'

interface KeyValuePair<K, V> {
  key: K
  value: V
}

interface ForkedRender<K extends string | number, V> {
  (
    props: {
      Component: ((props: KeyValuePair<K, V>) => React.ReactElement<any>)
    },
  ): React.ReactFragment
}

export function useForkedStoreState<T>(
  source: Source<T[]>,
  getKey: (t: T, i: number) => string | number = (_, i) => i,
  shallow: boolean = true,
): ForkedRender<any, T> {
  const store = useContext(StoreContext)
  const setup = useIsFirstRender()
  const [slice] = useState(
    setup
      ? getSlice(store, source)
          .use(keyFork)
          .keyFork(getKey, shallow)
      : noop,
  )

  // TODO: store this between renders
  return useState(
    setup
      ? () => ({
          Component,
        }: {
          Component: (props: { key: any; value: T }) => any
        }) => {
          const contents = useSlice(store, source, slice)
          const [MemoizedRender] = useState(
            setup
              ? () =>
                  memo(
                    ({
                      key,
                      value: slice,
                    }: KeyValuePair<string | number, Slice<T>>) => {
                      const value = useSlice(store, source, slice)
                      return <Component key={key} value={value} />
                    },
                    (a, b) => a.value === b.value,
                  )
              : noop,
          )
          return (
            <React.Fragment>
              {contents.map(({ key, value }) => (
                <MemoizedRender key={key} value={value} />
              ))}
            </React.Fragment>
          )
        }
      : noop,
  )[0]
}
