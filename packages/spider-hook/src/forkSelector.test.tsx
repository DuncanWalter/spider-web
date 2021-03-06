import React, { memo } from 'react'
import { render, cleanup, waitForDomChange } from 'react-testing-library'

import { createReducer, settable } from '@dwalter/create-reducer'

import { Provider } from './Provider'
import { useDispatch } from './useDispatch'
import { useSelector } from './useSelector'
import { forkSelector } from './forkSelector'
import { Dispatch, Selector } from './types'
import { noop } from './utils'

afterEach(cleanup)

test('Testing the Fork component', async done => {
  const [numbers, { set: setNumbers }] = createReducer('collection', [1, 2], {
    ...settable<number[]>(),
  })

  const getNumberSelectors = forkSelector(numbers, (_, i) => i)

  let collectionRenderCount = 0
  let itemRenderCount = 0
  let dispatch: Dispatch = noop

  function Collection() {
    collectionRenderCount += 1
    dispatch = useDispatch()
    const numberSelectors = useSelector(getNumberSelectors)
    return (
      <div data-testid="collection">
        {numberSelectors.map(([key, getNumber]) => {
          return <Item key={key} getItem={getNumber} />
        })}
      </div>
    )
  }

  const Item = memo(function({ getItem }: { getItem: Selector<number> }) {
    itemRenderCount += 1
    const item = useSelector(getItem)
    return <div>{item}</div>
  })

  const { getByTestId, rerender } = render(
    <Provider>
      <Collection />
    </Provider>,
  )

  const component = getByTestId('collection') as HTMLElement
  expect(component.children.length).toBe(2)
  expect(collectionRenderCount).toBe(1)
  expect(itemRenderCount).toBe(2)

  rerender(
    <Provider>
      <Collection />
    </Provider>,
  )

  expect(component.children.length).toBe(2)
  expect(collectionRenderCount).toBe(2)
  expect(itemRenderCount).toBe(2)

  dispatch(setNumbers([1, 3]))

  waitForDomChange({ container: component })

  expect(component.children.length).toBe(2)
  expect(collectionRenderCount).toBe(2)
  expect(itemRenderCount).toBe(3)

  dispatch(setNumbers([1, 3, 2]))

  expect(component.children.length).toBe(3)
  expect(collectionRenderCount).toBe(3)
  expect(itemRenderCount).toBe(4)

  done()
})
