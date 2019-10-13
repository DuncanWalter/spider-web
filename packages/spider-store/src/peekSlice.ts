import { Slice } from './slice'

function peekSlice<V>(slice: Slice<V>, marks: Slice[]): V {
  if (!slice.children.isEmpty() || marks.indexOf(slice) >= 0) {
    return slice.value
  }

  marks.push(slice)

  for (const dependency of slice.dependencies) {
    peekSlice(dependency, marks)
  }

  slice.hasUpdate()

  return slice.value
}

/**
 * Retrieves the current, valid value of a `Slice`.
 * Can be safely used in actions. Is not safe for use
 * in reducers and selectors.
 */
function safePeekSlice<V>(slice: Slice<V>): V {
  return peekSlice(slice, [])
}

export { safePeekSlice as peekSlice }
