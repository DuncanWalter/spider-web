import { Slice } from './slice'
import { SliceSet } from './SliceSet'

function propagateUpdate(slice: Slice, marks: SliceSet) {
  const updated = slice.tryUpdate()
  if (updated) {
    for (let child of slice.children.cleaned()) {
      if (child.dependencies.length === 1) {
        propagateUpdate(child, marks)
      } else if (!marks.has(child)) {
        marks.add(child)
      }
    }
  }
}

export function propagateSlices(marks: SliceSet) {
  while (marks.size !== 0) {
    propagateUpdate(marks.popMin()!, marks)
  }
}
