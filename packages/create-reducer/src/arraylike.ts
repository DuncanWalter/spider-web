export function arraylike<Item>() {
  return {
    add(state: Item[], item: Item) {
      state.push(item)
      return state
    },
    delete(state: Item[], index: number) {
      const length = state.length
      if (length <= index || index < -length) {
        return state
      }
      state.splice((index + length) % length, 1)
      return state
    },
    remove(state: Item[], item: Item) {
      const index = state.indexOf(item)
      if (index < 0) {
        return state
      }
      state.splice(index, 1)
      return state
    },
    update(state: Item[], index: number, item: Item) {
      const length = state.length
      if (length <= index || index < -length) {
        return state
      }
      state[(index + length) % length] = item
      return state
    },
  }
}
