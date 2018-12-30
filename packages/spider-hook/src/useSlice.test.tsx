import * as React from 'react'
import { render, cleanup, waitForDomChange } from 'react-testing-library'
import { createStore } from '@dwalter/spider-store'
import { useSlice } from './useSlice'

afterEach(cleanup)

test('Testing the useSlice hook', async done => {
  const { dispatch, wrapReducer } = createStore()

  const counters = wrapReducer<number>((state = 0) => state + 1)

  function Counter() {
    const counter = useSlice(counters)
    return <div>{counter}</div>
  }

  const { container } = render(<Counter />)

  expect(container.textContent).toBe('1')

  dispatch({ type: '@test' })

  expect(container.textContent).toBe('1')

  await waitForDomChange({ container })

  expect(container.textContent).toBe('2')

  dispatch({ type: '@test' })
  dispatch({ type: '@test' })

  await waitForDomChange({ container })

  expect(container.textContent).toBe('4')

  done()
})
