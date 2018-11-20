import { createStore } from './createStore'
import { map, join } from './operations'

test('Diamond case duplicates no work', () => {
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

  const double = counter.use(map).map(v => 2 * v)

  counter
    .use(map, join)
    .map(v => -v)
    .join([double], (neg, dub) => neg + dub)
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
