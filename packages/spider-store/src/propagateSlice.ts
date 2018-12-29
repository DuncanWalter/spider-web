import { Slice, __Slice__ } from './slice'
import { SliceSet } from './SliceSet'

function updateSlice(slice: Slice, marks: SliceSet): void {
  const updated = slice.tryUpdate()
  if (updated) {
    for (let child of slice.children.cleaned()) {
      if (child.dependencies.length === 1) {
        updateSlice(child, marks)
      } else if (!marks.has(child)) {
        marks.add(child)
      }
    }
  }
}

export function propagateSlice(marks: SliceSet) {
  while (marks.size !== 0) {
    updateSlice(marks.popMin()!, marks)
  }
}
