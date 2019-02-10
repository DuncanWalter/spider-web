import * as React from 'react'
import {
  render,
  cleanup,
  waitForDomChange,
  fireEvent,
} from 'react-testing-library'

import { Dispatch } from '@dwalter/spider-store'

import { SpiderRoot } from './SpiderRoot'
import { useActions } from './useActions'
import { createSideEffect, useSideEffect } from './useSideEffect'
import { createSelector, useSelector } from './useSelector'

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
    const counter = useSelector(getDoubleCounter)

    // bind actions
    const actions = useActions({ increment })

    return (
      <div data-testid="counter" onClick={actions.increment}>
        {counter}
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

  // await waitForDomChange({ container: component })

  expect(component.textContent).toBe('4')
  expect(lastValue).toBe(4)

  fireEvent.click(component)
  fireEvent.click(component)

  // await waitForDomChange({ container: component })

  expect(component.textContent).toBe('8')
  expect(lastValue).toBe(8)

  done()
})
