import { createStore } from '@dwalter/spider-store'
import { createReducer, settable } from '@dwalter/create-reducer'
import { keyFork } from '.'

test('Keyed forking dedups and updates properly', async done => {
  const { dispatch, wrapReducer } = createStore()

  const [collection, collectionActions] = createReducer('', [1], {
    ...settable<number[]>(),
  })

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

  dispatch(collectionActions.set([2]))

  expect(outerChanges).toBe(1)
  expect(innerChanges).toBe(2)

  dispatch(collectionActions.set([2, 3]))

  expect(outerChanges).toBe(2)
  expect(innerChanges).toBe(2)

  done()
})
