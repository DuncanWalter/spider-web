import { Vertex } from '../vertex'
import { PrioritySet } from '../prioritySet'
import { propagateVertex } from '../propagateVertex'

declare module '../vertex' {
  interface Vertex<Ds, V> {
    await<U>(this: Vertex<Ds, Promise<U>>): Vertex<[Vertex<Ds, Promise<U>>], U>
  }
}

Vertex.prototype.await = function<Ds extends Vertex<any, any>[], U>(
  this: Vertex<Ds, Promise<U>>,
) {
  const awaiter = new Vertex([this] as [Vertex<Ds, Promise<U>>], ([value]) => {
    value
      .then(v => {
        awaiter.cachedOutput = v
        awaiter.revoke()
        const marks = new PrioritySet<Vertex<any, any>>()
        marks.add(awaiter)
        propagateVertex(marks)
      })
      .catch(err => {
        throw err
      })
    return null as null | U
  })
  return awaiter
}
