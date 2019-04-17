# createSideEffect()

Traditionally, side effects in state management are routines that run when store state changes in a particular way or when certain actions are dispatched. Side effects that run in response to dispatched actions are usually best achieved using thunk actions or other patterns. For side effects that run in response to state changes, `spider-hook` provides the utilities `createSideEffect()` and `useSideEffect()`.

## Arguments

- **source**: the source to subscribe to and resolve.
- **effect**: a function that is called whenever the state contained within the source updates. The **effect** function is also passed a `dispatch()` function and a `resolve()` function as described in the documentation for `useActions()`.

## Returns

A SideEffect object which can be passed into the `useSideEffect()` function.

## Examples

The below example simply prints the counter every time it changes.

```javascript
const mySideEffect = createSideEffect(getCounter, counter => {
  console.log(counter)
})
```

It is safe to dispatch actions, resolve reducers, and resolve selectors from within a side effect.

```javascript
const mySideEffect = createSideEffect(
  getCounter,
  (counter, dispatch, resolve) => {
    dispatch(someAction())
    console.log(counter === resolve(getCounter)) // always true
  },
)
```
