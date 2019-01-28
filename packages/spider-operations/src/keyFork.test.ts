import { createStore, createSettableState } from '@dwalter/spider-store'
import { keyFork } from '.'

test('Keyed forking dedups and updates properly', async done => {
  const { dispatch, wrapReducer } = createStore()

  const [collection, setCollection] = createSettableState('', [1])

  const slices = wrapReducer(collection)
    .use(keyFork)
    .keyFork((_, i) => i)

  let outerChanges = 0
  let innerChanges = 0

  slices.subscribe(initialContents => {
    outerChanges++
    let [{ value: innerSlice }] = initialContents
    if (outerChanges === 1) {
      innerSlice.subscribe(v => {
        console.log(v)
        innerChanges++
      })
    }
  })

  expect(outerChanges).toBe(1)
  expect(innerChanges).toBe(1)

  dispatch(setCollection([2]))

  expect(outerChanges).toBe(1)
  expect(innerChanges).toBe(2)

  dispatch(setCollection([2, 3]))

  expect(outerChanges).toBe(2)
  expect(innerChanges).toBe(2)

  done()
})
