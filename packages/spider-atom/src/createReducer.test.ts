import { createReducer } from '.'
import { settableReducerBehavior } from './settableReducerBehavior'
import { Action } from '@dwalter/spider-store'

test('Settable reducer behavior creates settable state', () => {
  const [reducer, actions] = createReducer('settable', 0, {
    ...settableReducerBehavior<number>(),
  })

  const initial = reducer(undefined, {} as Action)

  expect(initial).toBe(0)

  const output = reducer(43, actions.set(4))

  expect(output).toBe(4)

  const action = actions.set(4)

  expect(action.type).toBe('@settable/set')
})
