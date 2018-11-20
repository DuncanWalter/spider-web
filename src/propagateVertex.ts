import { PrioritySet } from './prioritySet'
import { Vertex } from './vertex'

export function propagateVertex(marks: PrioritySet<Vertex<unknown>>) {
  while (marks.size !== 0) {
    const node = marks.pop()
    if (node.revoked) {
      const updated = node.tryUpdate()
      if (updated) {
        for (let child of node.children) {
          if (child) {
            child.revoke()
            if (child.id) {
              marks.add(child)
            }
          }
        }
      }
    }
  }
}
