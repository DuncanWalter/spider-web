import { Slice, __Slice__ } from './slice'
import { SliceSet } from './SliceSet'

function updateSlice(slice: Slice, marks: SliceSet): void {
  const updated = slice.tryUpdate()
  if (updated) {
    const children = slice.children.cleaned()
    for (let child of children) {
      if (child.dependencies.length === 1) {
        updateSlice(child, marks)
      } else if (child.dependencies[0] === slice) {
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
