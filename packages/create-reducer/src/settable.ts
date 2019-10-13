export function settable<State>() {
  return {
    set(_: State, newState: State) {
      return newState
    },
  }
}
