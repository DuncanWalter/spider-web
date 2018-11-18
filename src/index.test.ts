import { createStore } from './createStore'
import './lib/with'
import './lib/thru'
import './lib/map'

test('Diamond case optimization', () => {
  const { dispatch, wrapReducer } = createStore()

  let reducerCalls = 0
  let subscriptionCalls = 0
  let value = 0

  const counter = wrapReducer((i: number = 0) => {
    reducerCalls += 1
    return ++i
  })

  expect(value).toBe(0)
  expect(reducerCalls).toBe(1)
  expect(subscriptionCalls).toBe(0)

  const double = counter.map(v => 2 * v)

  counter
    .map(v => -v)
    .with([double], (neg, dub) => neg + dub)
    .subscribe(v => {
      subscriptionCalls++
      value = v
    })

  expect(value).toBe(1)
  expect(reducerCalls).toBe(1)
  expect(subscriptionCalls).toBe(1)

  dispatch({ type: 'increment' })

  expect(value).toBe(2)
  expect(reducerCalls).toBe(2)
  expect(subscriptionCalls).toBe(2)
})
