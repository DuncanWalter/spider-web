import { createStore, joinSlices, resolveSlice } from '../lib/index'
// import { map, fork } from '@dwalter/spider-operations'

test('Diamond case handling is efficient and stable', async done => {
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

  const double = joinSlices([counter], v => 2 * v)
  const negative = joinSlices([counter], v => -v)

  joinSlices([double, negative], (neg, dub) => {
    return neg + dub
  }).subscribe(v => {
    subscriptionCalls++
    value = v
  })

  expect(counter.children.size).toBe(2)

  expect(value).toBe(1)
  expect(reducerCalls).toBe(1)
  expect(subscriptionCalls).toBe(1)

  await dispatch({ type: 'increment' })

  expect(value).toBe(2)
  expect(reducerCalls).toBe(2)
  expect(subscriptionCalls).toBe(2)

  done()
})
