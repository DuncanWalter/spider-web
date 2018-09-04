import { Just } from '../utils'

export type VertexValue<V> = V extends Vertex<any, infer Value> ? Value : never

export type VertexConfig<V extends Just> = {
  initialValue?: V
  shallow?: boolean
  lazy?: boolean
  volatile?: boolean
}

const invalidCache = Symbol('INVALID_CACHE')
interface Pushable<V> {
  push(value: V): void
}

export abstract class Vertex<D = any, I = any, V extends Just = any>
  implements Pushable<I> {
  private children: (null | Pushable<V>)[] = []
  private childCount: number
  private create: (dependencies: I) => V | null
  private cache: V
  private revoked: boolean
  cachedInput: I
  volatile?: boolean
  shallow?: boolean
  lazy?: boolean

  constructor(
    create: (a: I) => V | null,
    cachedInput: I,
    config?: VertexConfig<V>,
  ) {
    if (config) {
      const {
        shallow = true,
        lazy = true,
        volatile = false,
        initialValue,
      } = config
      this.lazy = lazy
      this.shallow = shallow
      this.volatile = volatile
      this.revoked = initialValue === undefined
      this.cache = this.revoked ? (invalidCache as any) : initialValue
    } else {
      this.shallow = true
      this.lazy = true
      this.volatile = false
      this.revoked = true
      this.cache = invalidCache as any
    }
    this.create = create
    this.children = []
    this.childCount = 0
    this.cachedInput = cachedInput
  }

  revoke(value?: V) {
    const lastValue = this.cache
    this.revoked = true
    if (this.childCount > 0 || !this.lazy || value !== undefined) {
      const newValue =
        value !== undefined ? value : this.create(this.cachedInput)
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
    const newValue = this.create(this.cachedInput)
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

  // TODO: Is there a way to do this without adding to the construction cost?
  private publish = (newValue: V): void => {
    if ((!this.shallow || newValue !== this.cache) && newValue !== null) {
      this.revoke(newValue)
    }
  }
  bind<P, R>(
    transform: (state: V, payload: P, publish: (value: V) => void) => R,
    payload: P,
  ): R {
    return transform(this.cache, payload, this.publish)
  }
}
