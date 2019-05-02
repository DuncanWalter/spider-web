import * as React from 'react'
import { render, cleanup, fireEvent } from 'react-testing-library'

import { SpiderRoot } from './SpiderRoot'
import { useSideEffect } from './useSideEffect'
import { useSelector } from './useSelector'
import { createSelector } from './createSelector'
import { createSideEffect } from './createSideEffect'
import { useDispatch } from './useDispatch'
import { Dispatch } from './types'

afterEach(cleanup)

test('Testing the useAction hook', async done => {
  // create state reducers by any means
  const counter = (state = 0) => state + 1

  const getDoubleCounter = createSelector(
    [counter, counter],
    (x, y) => x + y,
  )

  let lastValue = NaN

  const watchDoubleCounter = createSideEffect(
    getDoubleCounter,
    x => (lastValue = x),
  )

  // create actions / actionCreators / actionSchedulers
  function increment() {
    return (dispatch: Dispatch) =>
      dispatch({ type: '@test', reducers: [counter] })
  }

  function Counter() {
    useSideEffect(watchDoubleCounter)

    // get fragments of your store
    const dispatch = useDispatch()
    const count = useSelector(getDoubleCounter)

    return (
      <div
        data-testid="counter"
        onClick={() => {
          dispatch(increment())
        }}
      >
        {count}
      </div>
    )
  }

  const { getByTestId, rerender } = render(
    <SpiderRoot>
      <Counter />
    </SpiderRoot>,
  )

  const component = getByTestId('counter')
  expect(component.textContent).toBe('2')

  // Rerendering will force effects to run.
  // Normally they would run asynchronously after rendering.
  rerender(
    <SpiderRoot>
      <Counter />
    </SpiderRoot>,
  )

  expect(component.textContent).toBe('2')
  expect(lastValue).toBe(2)

  fireEvent.click(component)

  expect(component.textContent).toBe('4')
  expect(lastValue).toBe(4)

  fireEvent.click(component)
  fireEvent.click(component)

  expect(component.textContent).toBe('8')
  expect(lastValue).toBe(8)

  done()
})
