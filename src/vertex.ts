import { mapObjectProps } from './utils'

type VertexValue<V> = V extends Vertex<any, infer Value> ? Value : never

type DependencyValues<Dependencies> = Dependencies extends VertexMap
  ? { [K in keyof Dependencies]: VertexValue<Dependencies[K]> }
  : VertexValue<Dependencies>

type DependencySubscriptions<Dependencies> = Dependencies extends VertexMap
  ? { [K in keyof Dependencies]: number }
  : number

type VertexMap = {
  [props: string]: Vertex
}

type VertexBehavior<D, V> =
  | ((dependencies: DependencyValues<D>) => V)
  | {
      seed: V
      mapping(dependencies: DependencyValues<D>): V | null
      shallow?: boolean
      lazy?: boolean
      volatile?: boolean
    }
  | {
      mapping(dependencies: DependencyValues<D>): V
      shallow?: boolean
      lazy?: boolean
      volatile?: boolean
    }

const invalidCache = Symbol('INVALID_CACHE')
interface Pushable<V> {
  push(value: V): void
}

export abstract class Vertex<
  Dependencies extends VertexMap | Vertex = any,
  Value = Dependencies
> implements Pushable<DependencyValues<Dependencies>> {
  private children: (null | Pushable<Value>)[] = []
  private childCount: number
  private mapping: (
    dependencies: DependencyValues<Dependencies>,
  ) => Value | null
  private cache: Value
  private revoked: boolean
  cachedInput: DependencyValues<Dependencies>
  volatile?: boolean
  shallow?: boolean
  lazy?: boolean

  constructor(behavior: VertexBehavior<Dependencies, Value>, cachedInput: any) {
    if (behavior instanceof Function) {
      this.mapping = behavior
      this.shallow = true
      this.lazy = true
      this.volatile = false
    } else {
      this.mapping = behavior.mapping
      this.shallow = behavior.shallow === undefined ? true : behavior.shallow
      this.lazy = behavior.lazy === undefined ? true : behavior.lazy
      this.volatile =
        behavior.volatile === undefined ? false : behavior.volatile
    }
    this.children = []
    this.childCount = 0
    this.revoked = true
    this.cachedInput = cachedInput
    this.cache = invalidCache as any
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

  push(value: DependencyValues<Dependencies>) {
    this.cachedInput = value
    this.revoke()
  }

  abstract assertCachedDependencyValues(): boolean
  pull(): Value {
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
  subscribe(newChild: { push(v: Value): void }): number {
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

export class NullVertex<Value> extends Vertex<any, Value> {
  constructor(behavior: VertexBehavior<any, Value>) {
    super(behavior, undefined)
  }
  propagateSubscription() {}
  propagateUnsubscription() {}
  assertCachedDependencyValues() {
    return true
  }
}

export class MonoVertex<Dependency extends Vertex, Value> extends Vertex<
  Dependency,
  Value
> {
  dependency: Dependency
  subscription?: number

  constructor(
    dependency: Dependency,
    behavior: VertexBehavior<Dependency, Value>,
  ) {
    super(behavior, invalidCache)
    this.dependency = dependency
    this.cachedInput = invalidCache as any
    this.lazy = dependency.lazy
    this.shallow = dependency.shallow
    this.volatile = dependency.volatile
  }
  propagateSubscription() {
    this.subscription = this.dependency.subscribe(
      this,
    ) as DependencySubscriptions<Dependency>
  }
  propagateUnsubscription() {
    if (this.subscription !== undefined) {
      this.dependency.unsubscribe(this.subscription)
      this.subscription = undefined
    }
  }
  assertCachedDependencyValues() {
    const lastValue = this.cachedInput
    this.cachedInput = this.dependency.pull()
    return lastValue === this.cachedInput && !!this.dependency.shallow
  }
}

export class PolyVertex<Dependencies extends VertexMap, Value> extends Vertex<
  Dependencies,
  Value
> {
  dependencies: Dependencies
  subscriptions?: { [K in keyof Dependencies]: number }

  constructor(
    dependencies: Dependencies,
    behavior: VertexBehavior<Dependencies, Value>,
  ) {
    super(behavior, {})
    this.dependencies = dependencies
    this.cachedInput = {} as any
  }

  propagateSubscription() {
    const that = this
    this.subscriptions = mapObjectProps(
      this.dependencies,
      (dep, key) => {
        return dep.subscribe({
          push(value) {
            ;(that.cachedInput as any)[key] = value
            that.push(that.cachedInput)
          },
        })
      },
      {},
    )
  }

  propagateUnsubscription() {
    if (this.subscriptions) {
      mapObjectProps(this.subscriptions, (sub, key) => {
        this.dependencies[key].unsubscribe(sub)
      })
      this.subscriptions = undefined
    }
  }

  assertCachedDependencyValues(): boolean {
    let cacheIsValid = true
    for (const key of Object.keys(this.dependencies)) {
      const dep = this.dependencies[key as keyof Dependencies]
      const newValue = dep.pull()
      if (this.cachedInput[key] !== newValue || !dep.shallow) {
        this.cachedInput[key] = newValue
        cacheIsValid = false
      }
    }
    return cacheIsValid
  }
}
