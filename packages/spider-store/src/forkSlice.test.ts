import { createStore } from './createStore'
import { createReducer, settable } from '@dwalter/create-reducer'
import { forkSlice } from './forkSlice'

test('Keyed forking dedups and updates properly', async done => {
  const { dispatch, wrapReducer } = createStore()

  const [collection, collectionActions] = createReducer('', [1], {
    ...settable<number[]>(),
  })

  const slices = forkSlice(wrapReducer(collection), (_, i) => i)

  let outerChanges = 0
  let innerChanges = 0
  let inner: any = null

  slices.subscribe(initialContents => {
    outerChanges++
    const [[, innerSlice]] = initialContents
    if (outerChanges === 1) {
      inner = innerSlice
      innerSlice.subscribe(() => {
        innerChanges++
      })
    }
    if (outerChanges === 2) {
      expect(inner).toBe(innerSlice)
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

  dispatch(collectionActions.set([2]))
  dispatch(collectionActions.set([2, 3]))

  done()
})
