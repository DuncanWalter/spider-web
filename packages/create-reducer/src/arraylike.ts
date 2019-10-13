export function arraylike<Item>() {
  return {
    add(state: Item[], item: Item) {
      const newState = state.slice()
      newState.push(item)
      return newState
    },
    delete(state: Item[], index: number) {
      const length = state.length
      if (length <= index || index < -length) {
        return state
      }
      const newState = state.slice()
      newState.splice((index + length) % length, 1)
      return newState
    },
    remove(state: Item[], item: Item) {
      const index = state.indexOf(item)
      if (index < 0) {
        return state
      }
      const newState = state.slice()
      newState.splice(index, 1)
      return newState
    },
    update(state: Item[], index: number, item: Item) {
      const length = state.length
      if (length <= index || index < -length) {
        return state
      }
      const newState = state.slice()
      newState[(index + length) % length] = item
      return newState
    },
  }
}
