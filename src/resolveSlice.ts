import { Slice } from './slice'
import { SliceSet } from './SliceSet'

function mark(v: Slice, marks: SliceSet) {
  if (v.children.size === 0 && !marks.has(v)) {
    marks.add(v)
    v.dependencies.forEach((dependency: Slice) => {
      mark(dependency, marks)
    })
  }
}

export function resolveSlice<V>(slice: Slice<V>): V {
  const marks = new SliceSet()
  mark(slice, marks)
  while (marks.size !== 0) {
    const node = marks.take()!
    node.tryUpdate()
  }
  return slice.cachedOutput
}
