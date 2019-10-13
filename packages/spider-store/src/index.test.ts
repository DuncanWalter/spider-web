import { createStore } from './createStore'
import { joinSlices } from './joinSlices'
import { Action, Middleware } from './types'

test('Diamond case handling is efficient and stable', async done => {
  const { dispatch, wrapReducer } = createStore()

  let reducerCalls = 0
  let subscriptionCalls = 0
  let value = 0

  function reducer(i = 0) {
    reducerCalls += 1
    return ++i
  }

  const counter = wrapReducer(reducer)

  expect(value).toBe(0)
  expect(reducerCalls).toBe(1)
  expect(subscriptionCalls).toBe(0)

  const left = joinSlices(i => i, counter)
  const right = joinSlices(i => i, counter)
  const union = joinSlices((l, r) => l + r, left, right)

  union.subscribe(u => {
    subscriptionCalls++
    value = u
  })

  expect(counter.children.slices.length).toBe(2)

  expect(value).toBe(2)
  expect(reducerCalls).toBe(1)
  expect(subscriptionCalls).toBe(1)

  dispatch({ type: 'increment', reducers: [reducer] })

  expect(value).toBe(4)
  expect(reducerCalls).toBe(2)
  expect(subscriptionCalls).toBe(2)

  dispatch([{ type: 'increment', reducers: [reducer] }])

  expect(value).toBe(6)
  expect(reducerCalls).toBe(3)
  expect(subscriptionCalls).toBe(3)

  done()
})

test('Calls to dispatch are flattened', done => {
  const { dispatch, wrapReducer } = createStore()
  function reducer(i = 0) {
    return i + 1
  }
  const counter = wrapReducer(reducer)
  let count = -1
  counter.subscribe(i => {
    expect(i).toBe(count + 2)
    count = i
    if (i < 10) {
      dispatch([
        { type: 'any', reducers: [reducer] },
        [{ type: 'any', reducers: [reducer] }],
      ])
    } else {
      expect(count).toBe(11)
      done()
    }
  })
})

test('Arbitrary reducers with known action types can be used', () => {
  interface TestAction1 extends Action {
    type: 'test-action-1'
  }

  interface TestAction2 extends Action {
    type: 'test-action-2'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function reducer(state = 1, action: TestAction1 | TestAction2) {
    return state + 1
  }

  const { wrapReducer } = createStore()

  wrapReducer(reducer)
})

test('Middleware is properly applied and run', () => {
  let count = 0
  const countingMiddleware: Middleware = (_, { dispatch }) => ({
    dispatch(action) {
      count++
      dispatch(action)
    },
  })

  const { dispatch, wrapReducer } = createStore(countingMiddleware)

  let reducerCalls = 0

  function reducer(i = 0) {
    reducerCalls += 1
    return ++i
  }

  wrapReducer(reducer)

  expect(count).toBe(0)
  expect(reducerCalls).toBe(1)

  dispatch({ type: 'increment', reducers: [reducer] })

  expect(count).toBe(1)
  expect(reducerCalls).toBe(2)
})

test('peek extracts slice states', () => {
  const store = createStore()

  const reducer = (i = 0) => ++i

  const slice = store.wrapReducer(reducer)

  expect(store.peek(slice)).toBe(1)

  store.dispatch({ type: 'test', reducers: [reducer] })

  expect(store.peek(slice)).toBe(2)
})
