import { createStore, joinSlices } from '../lib/index'
import { resolveSlice } from './resolveSlice'

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

  const left = joinSlices(counter, i => i)
  const right = joinSlices(counter, i => i)
  const union = joinSlices(left, right, (l, r) => l + r)

  union.subscribe(u => {
    subscriptionCalls++
    value = u
  })

  expect(counter.children.size).toBe(2)

  expect(value).toBe(2)
  expect(reducerCalls).toBe(1)
  expect(subscriptionCalls).toBe(1)

  await dispatch({ type: 'increment' })

  expect(value).toBe(4)
  expect(reducerCalls).toBe(2)
  expect(subscriptionCalls).toBe(2)

  const resolution = dispatch({ type: 'increment' })

  expect(value).toBe(4)
  expect(reducerCalls).toBe(2)
  expect(subscriptionCalls).toBe(2)

  await resolution

  expect(value).toBe(6)
  expect(reducerCalls).toBe(3)
  expect(subscriptionCalls).toBe(3)

  done()
})

test('Calls to dispatch are flattened', done => {
  const { dispatch, wrapReducer } = createStore()
  const counter = wrapReducer<number>((i = 0) => i + 1)
  let count = -1
  counter.subscribe(i => {
    expect(i).toBe(count + 2)
    count = i
    if (i < 10) {
      dispatch(d => {
        d({ type: 'any' })
        d({ type: 'any' })
      })
    } else {
      expect(count).toBe(11)
      done()
    }
  })
})

test('Resolving works on complex structures', () => {
  const { wrapReducer } = createStore()
  const lCounter = wrapReducer<number>((i = 0) => i + 1)
  const rCounter = wrapReducer<number>((i = 0) => i + 1)

  const double = joinSlices(lCounter, rCounter, (a, b) => a + b)
  const quadruple = joinSlices(double, double, (a, b) => a + b)
  const octuple = joinSlices(quadruple, quadruple, (a, b) => a + b)

  expect(resolveSlice(octuple)).toBe(8)
})
