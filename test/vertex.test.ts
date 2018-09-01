import { NullVertex } from '../src/vertex/nullVertex'
import { MonoVertex } from '../src/vertex/monoVertex'
import { PolyVertex } from '../src/vertex/polyVertex'

function counter() {
  let i = 0
  return () => {
    return ++i
  }
}

test('Can construct all Vertex types', () => {
  const n = new NullVertex(() => 1)
  const m = new MonoVertex(n, n => n + 1)
  const p = new PolyVertex({ a: n, b: m }, ({ a, b }) => b - a === 1)
})

test('NullVertices are pullable and revokable', () => {
  const n = new NullVertex(counter())
  expect(n.pull()).toEqual(1)
  expect(n.pull()).toEqual(1)
  expect(n.revoke()).toBeUndefined()
  expect(n.pull()).toEqual(2)
})

test('MonoVertices are pullable and revokable', () => {
  const n = new NullVertex(counter())
  let timesCalled = 0
  const m = new MonoVertex(n, n => {
    return n + ++timesCalled
  })
  expect(m.pull()).toEqual(2)
  expect(m.pull()).toEqual(2)
  expect(m.revoke()).toBeUndefined()
  expect(m.pull()).toEqual(3)
  expect(n.revoke()).toBeUndefined()
  expect(m.pull()).toEqual(5)
})

test('PolyVertices are pullable and revokable', () => {
  const left = new NullVertex(counter())
  const right = new NullVertex(counter())
  let timesCalled = 0
  const poly = new PolyVertex(
    { left, right },
    ({ left, right }) => left + right + ++timesCalled,
  )
  expect(poly.pull()).toEqual(3)
  expect(poly.pull()).toEqual(3)
  expect(left.revoke()).toBeUndefined()
  expect(poly.pull()).toEqual(5)
  expect(poly.revoke()).toBeUndefined()
  expect(poly.pull()).toEqual(6)
})

test('Vertices can be subscribed to', () => {
  const i = new NullVertex(counter())
  let jCount = 0
  const j = new MonoVertex(i, n => ++jCount + n)
  let kCount = 0
  const k = new PolyVertex({ j }, ({ j }) => ++kCount + j)
  let lastValue = undefined
  k.subscribe({
    push(value: number) {
      lastValue = value
    },
  })
  expect(lastValue).toEqual(3)
  expect(i.revoke()).toBeUndefined()
  expect(lastValue).toEqual(6)
  expect(j.revoke()).toBeUndefined()
  expect(lastValue).toEqual(8)
  expect(k.revoke()).toBeUndefined()
  expect(lastValue).toEqual(9)
})

test('NullVertices can be unsubscribed from', () => {
  let callCount = 0
  const i = new NullVertex(() => ++callCount)
  expect(callCount).toEqual(0)
  let lValue
  const lSub = i.subscribe({
    push(value: number) {
      lValue = value
    },
  })
  expect(callCount).toEqual(1)
  let rValue
  const rSub = i.subscribe({
    push(value: number) {
      rValue = value
    },
  })
  expect(lValue).toEqual(1)
  expect(rValue).toEqual(1)
  expect(callCount).toEqual(1)
  i.revoke()
  expect(lValue).toEqual(2)
  expect(rValue).toEqual(2)
  i.unsubscribe(lSub)
  i.revoke()
  expect(lValue).toEqual(2)
  expect(rValue).toEqual(3)
  i.unsubscribe(rSub)
  i.revoke()
  expect(lValue).toEqual(2)
  expect(rValue).toEqual(3)
  expect(callCount).toEqual(3)
  expect(i.pull()).toEqual(4)
  expect(callCount).toEqual(4)
})

test('MonoVertices can be unsubscribed from', () => {
  let callCount = 0
  const i = new NullVertex(() => ++callCount)
  const j = new MonoVertex(i, i => i)
  expect(callCount).toEqual(0)
  let lValue
  const lSub = j.subscribe({
    push(value: number) {
      lValue = value
    },
  })
  expect(callCount).toEqual(1)
  let rValue
  const rSub = j.subscribe({
    push(value: number) {
      rValue = value
    },
  })
  expect(lValue).toEqual(1)
  expect(rValue).toEqual(1)
  expect(callCount).toEqual(1)
  i.revoke()
  expect(lValue).toEqual(2)
  expect(rValue).toEqual(2)
  j.unsubscribe(lSub)
  i.revoke()
  expect(lValue).toEqual(2)
  expect(rValue).toEqual(3)
  expect(callCount).toEqual(3)
  j.unsubscribe(rSub)
  i.revoke()
  expect(lValue).toEqual(2)
  expect(rValue).toEqual(3)
  expect(callCount).toEqual(3)
  expect(j.pull()).toEqual(4)
  expect(callCount).toEqual(4)
})

test('PolyVertices can be unsubscribed from', () => {
  let callCount = 0
  const i = new NullVertex(() => ++callCount)
  const j = new PolyVertex({ i }, ({ i }) => i)
  expect(callCount).toEqual(0)
  let lValue
  const lSub = j.subscribe({
    push(value: number) {
      lValue = value
    },
  })
  expect(callCount).toEqual(1)
  let rValue
  const rSub = j.subscribe({
    push(value: number) {
      rValue = value
    },
  })
  expect(lValue).toEqual(1)
  expect(rValue).toEqual(1)
  expect(callCount).toEqual(1)
  i.revoke()
  expect(lValue).toEqual(2)
  expect(rValue).toEqual(2)
  j.unsubscribe(lSub)
  i.revoke()
  expect(lValue).toEqual(2)
  expect(rValue).toEqual(3)
  expect(callCount).toEqual(3)
  j.unsubscribe(rSub)
  i.revoke()
  expect(lValue).toEqual(2)
  expect(rValue).toEqual(3)
  expect(callCount).toEqual(3)
  expect(j.pull()).toEqual(4)
  expect(callCount).toEqual(4)
})

test('Volatile Vertices update on every pull', () => {
  const i = new NullVertex({
    create: counter(),
    volatile: true,
  })
  expect(i.pull()).toEqual(1)
  expect(i.pull()).toEqual(2)
})

test('Eager Vertices update when revoked', () => {
  let callCount = 0
  const i = new NullVertex({
    create() {
      return ++callCount
    },
    lazy: false,
  })
  expect(i.pull()).toEqual(1)
  i.revoke()
  expect(callCount).toEqual(2)
  expect(i.pull()).toEqual(2)
  expect(callCount).toEqual(2)
})

test('Deep Vertices push values which equal their cached value', () => {
  const i = new NullVertex({
    create() {
      return 1
    },
    shallow: false,
  })
  let callCount = 0
  i.subscribe({
    push() {
      callCount++
    },
  })
  expect(callCount).toEqual(1)
  i.revoke()
  expect(callCount).toEqual(2)
})

test('Vertices accept functional binding', () => {
  const n = new NullVertex(() => 1)
  expect(n.pull()).toEqual(1)
  n.bind((i, d) => i + d, 1)
  expect(n.pull()).toEqual(2)
  n.bind((i, d) => i + d, 1)
  n.bind((i, d) => i + d, 1)
  expect(n.pull()).toEqual(4)
  n.revoke()
  expect(n.pull()).toEqual(1)
})
//
//
//
const gameInstance = defineResource(() => {
  return {
    score: 0,
    hand: [],
  }
})

const hand = defineResource(gameInstance, {
  mapping: game => game.hand,
  actions: {
    addCard: (hand, payload, publish) => {
      hand.push(1)
      publish(hand)
    },
    removeCard: (hand, payload, publish) => {
      hand.pop()
      publish(hand)
    },
  },
  shallow: false,
})

const score = defineResource(gameInstance, {
  mapping: game => game.score,
  actions: {
    addScore: (score, payload, publish) => {
      publish(score + payload)
    },
  },
})

const gameState = defineResource(
  { hand, score },
  {
    mapping: gameState => gameState,
    shallow: false,
  },
)

connectResources(gameState, MyComponent)
