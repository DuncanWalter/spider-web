import { createStore } from './createStore'
import { map } from './operations'
import { fork } from './operations/fork'
import { resolveSlice } from './resolveSlice'
import { joinSlices } from './joinSlices'

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

  const double = counter.use(map).map(v => 2 * v)
  const negative = counter.use(map).map(v => -v)

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

test('Slices can be forked successfully', async done => {
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

  await dispatch({ type: 'add' })

  const [innerSlice] = resolveSlice(slice)

  expect(resolveSlice(innerSlice)).toBe(-0)

  await dispatch({ type: 'add' })

  const [nextSlice] = resolveSlice(slice)

  expect(nextSlice === innerSlice).toBeTruthy()

  expect(resolveSlice(innerSlice)).toBe(-1)

  await dispatch({ type: 'cull' })

  done()
})
