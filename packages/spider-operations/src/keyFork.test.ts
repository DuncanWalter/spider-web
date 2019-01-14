import { createStore, utils, createSettableState } from '@dwalter/spider-store'
import { map, keyFork } from '.'

const { resolveSlice } = utils

test('Keyed forking dedups and updates properly', async done => {
  const { dispatch, wrapReducer } = createStore()

  const [collection, setCollection] = createSettableState([1])

  const slices = wrapReducer(collection)
    .use(keyFork)
    .keyFork((_, i) => i)

  const initialContents = resolveSlice(slices)
  expect(initialContents.length).toBe(1)
  let [{ value: innerSlice }] = initialContents
  expect(resolveSlice(innerSlice)).toBe(1)

  await dispatch(setCollection([2]))

  const secondContents = resolveSlice(slices)
  expect(initialContents === secondContents).toBe(true)
  ;[{ value: innerSlice }] = secondContents
  expect(resolveSlice(innerSlice)).toBe(2)

  await dispatch(setCollection([1, 3]))

  const thirdContents = resolveSlice(slices)
  expect(initialContents === thirdContents).toBe(false)
  expect(thirdContents[0].value === innerSlice)
  expect(resolveSlice(innerSlice)).toBe(1)

  done()
})
