import { createReducer } from '.'
import { settable } from './settable'
import { entityTable } from './entityTable'

test('Settable reducer behavior creates settable state', () => {
  const reducer = createReducer('settable', 0, {
    ...settable<number>(),
  })

  const initial = reducer(undefined, { type: '@' })

  expect(initial).toBe(0)

  const output = reducer(43, reducer.actions.set(4))

  expect(output).toBe(4)

  const action = reducer.actions.set(4)

  expect(action.type).toBe('@settable/set')
})

test('State types are inferred from configs', () => {
  const initial = {}
  const { actions } = createReducer('foo', initial, {
    ...entityTable<number>(n => n),
  })

  actions.add(6)
})
