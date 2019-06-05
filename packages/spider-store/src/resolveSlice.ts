import { Slice } from './slice'

function resolveSlice<V>(slice: Slice<V>, marks: Slice[]): V {
  if (!slice.children.isEmpty() || marks.indexOf(slice) >= 0) {
    return slice.value
  }
  marks.push(slice)
  for (let dependency of slice.dependencies) {
    resolveSlice(dependency, marks)
  }
  slice.hasUpdate()
  return slice.value
}

/**
 * Retrieves the current, valid value of a `Slice`.
 * Can be safely used in actions. Is not safe for use
 * in reducers and selectors.
 */
function safeResolveSlice<V>(slice: Slice<V>): V {
  return resolveSlice(slice, [])
}

export { safeResolveSlice as resolveSlice }
