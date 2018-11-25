import { PrioritySet } from './prioritySet'
import { Slice } from './slice'

export function propagateSlice(marks: PrioritySet<Slice<unknown>>) {
  while (marks.size !== 0) {
    const node = marks.pop()
    if (node.revoked) {
      const updated = node.tryUpdate()
      if (updated) {
        for (let child of node.children) {
          if (child) {
            child.revoke()
            if (!child.type) {
              marks.add(child)
            }
          }
        }
      }
    }
  }
}
