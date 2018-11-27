import { PrioritySet } from './prioritySet'
import { Slice } from './slice'

function mark(v: Slice, marks: PrioritySet<Slice>) {
  if (v.children.size === 0 && !marks.has(v)) {
    marks.add(v)
    v.dependencies.forEach((dependency: Slice) => {
      mark(dependency, marks)
    })
  }
}

export function resolveSlice<V>(slice: Slice<V>): V {
  const marks = new PrioritySet<Slice>()
  mark(slice, marks)
  while (marks.size !== 0) {
    const node = marks.pop()
    node.tryUpdate()
  }
  return slice.cachedOutput
}
