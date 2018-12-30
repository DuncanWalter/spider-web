import * as React from 'react'
import {
  render,
  cleanup,
  waitForDomChange,
  fireEvent,
} from 'react-testing-library'
import { Dispatch } from '@dwalter/spider-store'
import { useSlice } from './useSlice'
import { SpiderRoot } from './SpiderRoot'
import { wrapReducers } from './wrapReducers'
import { useAction } from './useAction'

afterEach(cleanup)

test('Testing the useAction hook', async done => {
  // create state reducers by any means
  const counters = (state = 0) => state + 1

  // wrap them and export created hooks
  const useCounters = wrapReducers({ counters })

  // create actions / actionCreators / actionSchedulers
  function incrementer() {
    return (dispatch: Dispatch<unknown>) => dispatch({ type: '@test' })
  }

  function Counter() {
    // get fragments of your store
    const { counters } = useCounters()

    // bind actions
    const increment = useAction(incrementer)

    // unwrap values in slices
    const counter = useSlice(counters)

    return (
      <div data-testid="counter" onClick={increment}>
        {counter}
      </div>
    )
  }

  const { getByTestId } = render(
    <SpiderRoot>
      <Counter />
    </SpiderRoot>,
  )

  const component = getByTestId('counter')

  expect(component.textContent).toBe('1')

  fireEvent.click(component)

  expect(component.textContent).toBe('1')

  await waitForDomChange({ container: component })

  expect(component.textContent).toBe('2')

  fireEvent.click(component)
  fireEvent.click(component)

  await waitForDomChange({ container: component })

  expect(component.textContent).toBe('4')

  done()
})
