import { PrioritySet } from './prioritySet'
import { Slice, __Slice__ } from './slice'

function updateSlice(slice: Slice, marks: PrioritySet<Slice>): void {
  const updated = slice.tryUpdate()
  if (updated) {
    for (let child of slice.children) {
      if (child instanceof __Slice__) {
        if (child.dependencies.length === 1) {
          updateSlice(child, marks)
        } else {
          marks.add(child)
        }
      } else {
        child(slice.cachedOutput)
      }
    }
  }
}

export function propagateSlice(marks: PrioritySet<Slice<unknown>>) {
  while (marks.size !== 0) {
    const node = marks.pop()
    updateSlice(node, marks)
  }
}
