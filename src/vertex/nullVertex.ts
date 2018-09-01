import { VertexBehavior, Vertex } from './vertex'
import { Just } from '../utils'

export type NullVertexBehavior<V extends Just> =
  | (() => V)
  | {
      initialValue: V
      create(): V | null
      shallow?: boolean
      lazy?: boolean
      volatile?: boolean
    }
  | {
      initialValue?: V
      create(): V
      shallow?: boolean
      lazy?: boolean
      volatile?: boolean
    }

export class NullVertex<V> extends Vertex<null, null, V> {
  constructor(behavior: NullVertexBehavior<V>) {
    super(behavior, null)
  }
  propagateSubscription() {}
  propagateUnsubscription() {}
  assertCachedDependencyValues() {
    return true
  }
}
