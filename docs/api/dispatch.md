# dispatch()

`dispatch()` is a flux style action dispatcher with built in thunk support modelled after `redux-thunk`. The `dispatch()` function for each store only updates the state slices for that store. If multiple actions are dispatched synchronously, the actions will be squashed and the state graph will only be updated once.

## Parameters:

Accepts a single argument: either an action or a thunk function which accepts the dispatch function as an argument.

## Returns:

If passed an action, returns a `Promise<void>` which resolves after the state graph has updated. If passed an action thunk, returns the value returned from the thunk.

## Example:

```javascript
// executes the three dispatches one after another
// and updates state each time. Returns a Promise.
const p: Promise<void> = dispatch(async dispatch => {
  await dispatch({ type: 'foo' })
  await dispatch({ type: 'bar' })
  await dispatch({ type: 'baz' })
})

// squashes the dispatches and only updates state,
// so state is only updated once. Returns void.
dispatch(dispatch => {
  dispatch({ type: 'foo' })
  dispatch({ type: 'bar' })
  dispatch({ type: 'baz' })
})
```
