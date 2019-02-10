import { Slice } from './slice'
import { SliceSet } from './SliceSet'

function propagateUpdate(slice: Slice, marks: SliceSet) {
  const updated = slice.tryUpdate()
  if (updated) {
    for (let [, child] of slice.children.slices) {
      if (child.dependencies.length === 1) {
        propagateUpdate(child, marks)
      } else {
        marks.add(child)
      }
    }
  }
}

export function propagateSlices(marks: SliceSet) {
  while (!marks.isEmpty()) {
    propagateUpdate(marks.popMin()!, marks)
  }
}
