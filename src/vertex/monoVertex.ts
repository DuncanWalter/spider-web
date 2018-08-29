import { Vertex, VertexBehavior } from './vertex'

type VertexValue<V> = V extends Vertex<any, any, infer T> ? T : never

export class MonoVertex<D extends Vertex, V> extends Vertex<
  D,
  VertexValue<D>,
  V
> {
  dependency: D
  subscription?: number

  constructor(dependency: D, behavior: VertexBehavior<D, VertexValue<D>, V>) {
    super(behavior, null)
    this.dependency = dependency
    this.cachedInput = null as any
    this.lazy = this.lazy === undefined ? dependency.lazy : this.lazy
    this.shallow =
      this.shallow === undefined ? dependency.shallow : this.shallow
    this.volatile =
      this.volatile === undefined ? dependency.volatile : this.volatile
  }
  propagateSubscription() {
    this.subscription = this.dependency.subscribe(this)
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
