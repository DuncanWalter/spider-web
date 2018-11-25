import { createStore } from './createStore'
import { map, join } from './operations'
import { fork } from './operations/fork'
import { resolveSlice } from './resolveSlice'

test('Diamond case handling is efficient and stable', () => {
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

  expect(counter.children.length).toBe(2)

  expect(value).toBe(1)
  expect(reducerCalls).toBe(1)
  expect(subscriptionCalls).toBe(1)

  dispatch({ type: 'increment' })

  expect(value).toBe(2)
  expect(reducerCalls).toBe(2)
  expect(subscriptionCalls).toBe(2)
})

test('Slices can be forked successfully', () => {
  const { dispatch, wrapReducer } = createStore()

  const slice = wrapReducer<number[]>((state = [], action) => {
    switch (action.type) {
      case 'add': {
        return [state.length, ...state]
      }
      case 'cull': {
        return state.filter(i => i % 2)
      }
      default: {
        return state
      }
    }
  })
    .use(fork, map)
    .fork(s => s.map(v => -1 * v))

  expect(resolveSlice(slice).length).toBe(0)

  dispatch({ type: 'add' })

  const [innerSlice] = resolveSlice(slice)

  expect(resolveSlice(innerSlice)).toBe(-0)

  dispatch({ type: 'add' })

  const [nextSlice] = resolveSlice(slice)

  expect(nextSlice === innerSlice).toBeTruthy()

  expect(resolveSlice(innerSlice)).toBe(-1)

  dispatch({ type: 'cull' })
})
