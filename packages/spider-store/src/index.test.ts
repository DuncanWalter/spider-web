import { createStore, joinSlices } from '../lib/index'

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

  const left = joinSlices(counter)
  const right = joinSlices(counter)

  const union = joinSlices(left, right)

  union.subscribe(([l, r]) => {
    subscriptionCalls++
    value = l[0] + r[0]
  })

  expect(counter.children.size).toBe(2)

  expect(value).toBe(2)
  expect(reducerCalls).toBe(1)
  expect(subscriptionCalls).toBe(1)

  await dispatch({ type: 'increment' })

  expect(value).toBe(4)
  expect(reducerCalls).toBe(2)
  expect(subscriptionCalls).toBe(2)

  done()
})
