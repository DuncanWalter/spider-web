import { VertexBehavior, Vertex } from './vertex'

export class NullVertex<V> extends Vertex<null, null, V> {
  constructor(behavior: VertexBehavior<null, null, V>) {
    super(behavior, null)
  }
  propagateSubscription() {}
  propagateUnsubscription() {}
  assertCachedDependencyValues() {
    return true
  }
}
