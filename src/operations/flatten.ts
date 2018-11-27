import { createOperation } from './createOperation'
import { Slice, createSlice } from '../slice'

const mute = createSlice([], i => i)

export const flatten = createOperation({
  flatten<U, O>(this: Slice<Slice<U, O>, O>): Slice<U, O> {
    let hiddenSlice: Slice<U, O> = mute
    let subscribed = false
    const outerSlice = createSlice([this], ([nextSlice]) => {
      if (nextSlice !== hiddenSlice) {
        if (this.children.size !== 0) {
          hiddenSlice.unsubscribe(outerSlice)
          nextSlice.subscribe(outerSlice)
        }
        hiddenSlice = nextSlice
      }
      if (this.children.has(outerSlice)) {
        if (!subscribed) {
          subscribed = true
          hiddenSlice.subscribe(outerSlice)
        }
      } else {
        if (subscribed) {
          subscribed = false
          hiddenSlice.unsubscribe(outerSlice)
          hiddenSlice = mute
        }
      }
      return nextSlice.cachedOutput
    })
    return outerSlice
  },
})
