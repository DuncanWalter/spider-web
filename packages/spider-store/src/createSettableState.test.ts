import { createSettableState } from '.'

test('State setters work on a variety of types', () => {
  const [number, setNumber] = createSettableState(0)

  expect(number(undefined, setNumber(1))).toBe(1)

  const [array, setArray] = createSettableState([] as number[])

  expect(array(undefined, setArray([1])).length).toBe(1)

  // TODO: complex testing
  // const [object, setObject] = createSettableState('obj', {
  //   foo: 0,
  //   bar: 0,
  // })

  // expect(object(undefined, setObject(partialUpdate({ bar: 1 }))).bar).toBe(1)
  // expect(object(undefined, setObject(partialUpdate(null))).bar).toBe(0)
})
