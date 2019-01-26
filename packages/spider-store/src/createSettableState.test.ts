import { createSettableState } from '.'
import { partialUpdate } from './createSettableState'

test('State setters work on a variety of types', () => {
  const [number, setNumber] = createSettableState('number', 0)

  expect(number(undefined, setNumber(i => i + 1))).toBe(1)

  const [array, setArray] = createSettableState('arr', [] as number[])

  expect(array(undefined, setArray(a => [...a, 1])).length).toBe(1)

  const [object, setObject] = createSettableState('obj', {
    foo: 0,
    bar: 0,
  })

  expect(object(undefined, setObject(partialUpdate({ bar: 1 }))).bar).toBe(1)
  expect(object(undefined, setObject(partialUpdate(null))).bar).toBe(0)
})
