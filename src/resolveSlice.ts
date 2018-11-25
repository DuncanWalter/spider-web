import { PrioritySet } from './prioritySet'
import { Slice } from './slice'

export function resolveSlice<V>(slice: Slice<V>): V {
  const marks = new PrioritySet<Slice<any, unknown>>()
  ;(function mark(v: Slice<any, any>) {
    if (v.childCount === 0 && !marks.has(v)) {
      marks.add(v)
      v.dependencies.forEach(mark)
    }
  })(slice)
  while (marks.size !== 0) {
    const node = marks.pop()
    node.tryUpdate()
  }
  return slice.cachedOutput
}
