import * as React from 'react'
import { useState, memo } from 'react'

import { Slice } from '@dwalter/spider-store'
import { keyFork } from '@dwalter/spider-operations'

import { useIsFirstRender, noop } from './utils'
import {
  Source,
  Selector,
  createCustomSelector,
  useSelector,
} from './useSelector'

interface ForkProps<K extends string | number, V> {
  selector: Source<V[]>
  Component: (
    props: { key: K; selector: Selector<V> },
  ) => React.ReactElement<any>
  getKey?: (value: V, index: number) => K
}

interface MemoComponentProps<K extends string | number, V> {
  key: K
  slice: Slice<V>
}

function forkSelector<K, V>(
  selector: Source<V[]>,
  getKey: (t: V, i: number) => K,
): Selector<{ key: K; value: Slice<V> }[]> {
  return createCustomSelector([selector], slice =>
    slice.use(keyFork).keyFork(getKey),
  )
}

function sliceSelector<V>(slice: Slice<V>): Selector<V> {
  return createCustomSelector<any[], V>([], () => slice)
}

function Fork<K extends string | number, V>({
  selector,
  getKey = (_, i) => i as K,
  Component,
}: ForkProps<K, V>) {
  const setup = useIsFirstRender()

  const getSlices = useState(setup ? forkSelector(selector, getKey) : noop)[0]
  const slices = useSelector(getSlices)

  const MemoComponent = useState(
    setup
      ? () =>
          memo(({ key, slice }: MemoComponentProps<K, V>) => {
            const getValue = useState(setup ? sliceSelector(slice) : noop)[0]
            return <Component key={key} selector={getValue} />
          })
      : noop,
  )[0]

  return (
    <React.Fragment>
      {slices.map(({ key, value }) => {
        return <MemoComponent key={key} slice={value} />
      })}
    </React.Fragment>
  )
}

/**
 * `Fork` is a heavily optimized component for rendering
 * collections. When the content of `Fork` update, the
 * component will usually not need to rerender, and all
 * unchanged children will not rerender.
 */
const MemoFork = memo(Fork) as typeof Fork

export { MemoFork as Fork }
