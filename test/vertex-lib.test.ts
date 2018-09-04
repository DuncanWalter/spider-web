import { NullVertex } from '../src/vertex/nullVertex'
import '../src/lib/map'
import '../src/lib/filter'
import '../src/lib/thru'

test('Vertices can be mapped', () => {
  let i = 0
  const n = new NullVertex(() => ++i)
  const m = n.map(i => 2 * i)
  expect(m.pull()).toEqual(2)
  expect(m.pull()).toEqual(2)
  n.revoke()
  expect(m.pull()).toEqual(4)
  n.revoke()
  expect(m.pull()).toEqual(6)
})

test('Vertices can be filtered', () => {
  let i = 0
  const n = new NullVertex(() => ++i)
  const m = n.filter(i => i % 2 === 0)
  expect(m.pull()).toEqual(1)
  expect(m.pull()).toEqual(1)
  n.revoke()
  expect(m.pull()).toEqual(2)
  n.revoke()
  expect(m.pull()).toEqual(2)
})

test('Vertices can be transduced', () => {
  const n = new NullVertex(() => 1)
  expect(n.thru(n => n.pull())).toEqual(1)
})
