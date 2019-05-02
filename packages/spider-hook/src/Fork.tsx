import React, { useMemo } from 'react'
import { useState, memo } from 'react'

import { Slice } from '@dwalter/spider-store'
import { keyFork } from '@dwalter/spider-operations'

import { createCustomSelector } from './createCustomSelector'
import { Source, Selector } from './types'
import { useSelector } from './useSelector'
import { useShouldUpdate, noop } from './utils'

interface ForkProps<K extends string | number, V> {
  selector: Source<V[]>
  render: (selector: Selector<V>, key: K) => React.ReactNode
  getKey?: (value: V, index: number) => K
}

interface MemoComponentProps<K extends string | number, V> {
  reactKey: K
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
  render,
}: ForkProps<K, V>) {
  const deps = [selector]

  const shouldUpdate = useShouldUpdate(deps)

  const getSlices = useMemo(
    shouldUpdate ? () => forkSelector(selector, getKey) : noop,
    deps,
  )

  const slices = useSelector(getSlices)

  const MemoComponent = useMemo(
    shouldUpdate
      ? () =>
          memo(({ reactKey, slice }: MemoComponentProps<K, V>) => {
            const getValue = sliceSelector(slice)
            return <React.Fragment>{render(getValue, reactKey)}</React.Fragment>
          })
      : noop,
    deps,
  )

  return (
    <React.Fragment>
      {slices.map(({ key, value }) => {
        return <MemoComponent key={key} reactKey={key} slice={value} />
      })}
    </React.Fragment>
  )
}

/**
 * `Fork` is a heavily optimized component for rendering
 * collections. When the contents of `Fork` update, the
 * component will usually not need to rerender, and any
 * unchanged children will never rerender. `Fork` does not
 * produce any container element, as it makes use of
 * `React.Fragment`.
 *
 * `Fork` accepts 3 props. The first is called `selector`.
 * Unsurprisingly, this prop accepts the selector of a
 * 'collection' (where 'collection' means any javascript array).
 * The second prop is called `render`. This prop accepts
 * a function which will render members of the collection. When
 * rendered, `Fork` passes a selector and key to `render` for
 * each member of the collection. Both of these arguments are mandatory,
 * as `Fork` would be unable to render anything without either of
 * them. The last prop, `getKey`, is optional. `getKey` is a
 * function which accepts a collection member and an index and
 * returns a valid React key. This allows for even further
 * optimization.
 */
const MemoFork = memo(Fork) as typeof Fork

export { MemoFork as Fork }
