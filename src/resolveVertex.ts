import { PrioritySet } from './prioritySet'
import { Vertex } from './vertex'

export function resolveVertex<V>(vertex: Vertex<V>): V {
  const marks = new PrioritySet<Vertex<any, unknown>>()
  ;(function mark(v: Vertex<any, any>) {
    if (v.childCount === 0 && !marks.has(v)) {
      marks.add(v)
      v.dependencies.forEach(mark)
    }
  })(vertex)
  while (marks.size !== 0) {
    const node = marks.pop()
    node.tryUpdate()
  }
  return vertex.cachedOutput
}
