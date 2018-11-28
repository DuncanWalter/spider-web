# `wrapReducer()`

`wrapReducer()` creates a state slice from a `flux` or `redux` style reducer function. If the reducer is a pure function and returns plain JSON, `spider-web` will always have a one-to-one mapping from every store state to every state slice. This means `spider-web` will be able to time travel like `redux`.

## Parameters:

Accepts a single argument: a reducer function. Reducer functions accept a state-action pair and return a state.

```javascript
interface Reducer<State, Action> {
  (state?: State, action: Action): State;
}
```

## Returns:

Returns a [Slice](./Slice) of state.
