# `dispatch()`

`dispatch()` is a flux style action dispatcher with built in thunk support modelled after `redux-thunk`. The `dispatch()` function for each store only updates the state slices for that store. If multiple actions are dispatched synchronously, the actions will be squashed and the state graph will only be updated once.

## Parameters:

Accepts a single argument: either an action or a thunk function which accepts the dispatch function as an argument.

## Returns:

If passed an action, returns a `Promise<void>` which resolves after the state graph has updated. If passed an action thunk, returns the value returned from the thunk.
