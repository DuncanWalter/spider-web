export type VertexValue<V> = V extends Vertex<any, infer Value> ? Value : never

// export type DependencyValues<Dependencies> = Dependencies extends VertexMap
//   ? { [K in keyof Dependencies]: VertexValue<Dependencies[K]> }
//   : Dependencies extends Vertex ? VertexValue<Dependencies> : null

// TODO: don't export- the impls should declare their own
export type VertexBehavior<D, I, V> =
  | ((dependencies: I) => V)
  | {
      initialValue: V
      mapping(dependencies: I): V | null
      shallow?: boolean
      lazy?: boolean
      volatile?: boolean
    }
  | {
      initialValue?: V
      mapping(dependencies: I): V
      shallow?: boolean
      lazy?: boolean
      volatile?: boolean
    }

const invalidCache = Symbol('INVALID_CACHE')
interface Pushable<V> {
  push(value: V): void
}

// let noChange
// if (!Symbol) {
//   noChange = ({ unique: 'NO_CHANGE' } as any) as symbol
// } else {
//   noChange = Symbol('NO_CHANGE')
// }

// TODO: make vertices generic on their dependency values as well?
export abstract class Vertex<D = any, I = any, V = D> implements Pushable<I> {
  private children: (null | Pushable<V>)[] = []
  private childCount: number
  private mapping: (dependencies: I) => V | null
  private cache: V
  private revoked: boolean
  cachedInput: I
  volatile?: boolean
  shallow?: boolean
  lazy?: boolean

  constructor(behavior: VertexBehavior<D, I, V>, cachedInput: any) {
    if (behavior instanceof Function) {
      this.mapping = behavior
      this.shallow = true
      this.lazy = true
      this.volatile = false
      this.revoked = true
      this.cache = invalidCache as any
    } else {
      const { mapping, shallow, lazy, volatile, initialValue } = behavior
      this.mapping = mapping
      this.shallow = shallow === undefined ? true : shallow
      this.lazy = lazy === undefined ? true : lazy
      this.volatile = volatile === undefined ? false : volatile
      this.revoked = initialValue === undefined
      this.cache = this.revoked ? (invalidCache as any) : initialValue
    }
    this.children = []
    this.childCount = 0
    this.cachedInput = cachedInput
  }

  revoke() {
    const lastValue = this.cache
    this.revoked = true
    if (this.childCount > 0 || !this.lazy) {
      const newValue = this.mapping(this.cachedInput)
      if (newValue !== null) {
        this.cache = newValue
        this.revoked = false
        if (newValue !== lastValue || !this.shallow) {
          for (const child of this.children) {
            if (child !== null) {
              child.push(newValue)
            }
          }
        }
      } else {
        this.revoked = false
      }
    }
  }

  push(value: I) {
    this.cachedInput = value
    this.revoke()
  }

  abstract assertCachedDependencyValues(): boolean
  pull(): V {
    if (!this.revoked && !this.volatile) {
      if (this.childCount > 0 || this.assertCachedDependencyValues()) {
        return this.cache
      }
    } else if (this.childCount === 0) {
      this.assertCachedDependencyValues()
    }
    const newValue = this.mapping(this.cachedInput)
    this.revoked = false
    if (newValue !== null) {
      this.cache = newValue
    }
    return this.cache
  }

  abstract propagateSubscription(): void
  subscribe(newChild: { push(v: V): void }): number {
    if (this.childCount === 0) {
      this.propagateSubscription()
    }
    this.childCount++
    for (let i = 0; i++; i < this.children.length) {
      if (!this.children[i]) {
        this.children[i] = newChild
        return i
      }
    }
    this.children.push(newChild)
    const subscription = this.children.length - 1
    newChild.push(this.pull())
    return subscription
  }

  abstract propagateUnsubscription(): void
  unsubscribe(subscription: number) {
    if (!this.children[subscription]) {
      throw new Error('Same Vertex child unsubscribed twice')
    }
    this.childCount--
    this.children[subscription] = null
    if (this.childCount === 0) {
      this.propagateUnsubscription()
    }
  }
}
