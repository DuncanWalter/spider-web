import { createSettableState } from '.'

test('State setters work on a variety of types', () => {
  const [number, setNumber] = createSettableState(0)

  expect(number(undefined, setNumber(i => i + 1))).toBe(1)

  const [array, setArray] = createSettableState([] as number[])

  expect(array(undefined, setArray(a => [...a, 1])).length).toBe(1)

  const [object, setObject] = createSettableState({
    foo: 0,
    bar: 0,
  })

  expect(object(undefined, setObject({ bar: 1 })).foo).toBe(0)
  expect(object(undefined, setObject({ bar: 1 })).bar).toBe(1)
  expect(object(undefined, setObject(null)).bar).toBe(0)
})
