# resolve()

In `spider-hook`, reducers and selectors can both be thought of as containers for state. However, the containers don't expose any way of reading that internal state. Instead, the state is 'magically' unwrapped by functions like `createSelector()` and `useSelector()`. This is almost always good enough to accomplish whatever you need. However, there are a few cases where it is useful to have an imperative way to retrieve the internal state from a container. In those situations, `spider-hook` will also provide a `resolve` function which takes a reducer or selector and returns that container's internal state.

# Examples

```javascript
const mySideEffect = createSideEffect(
  getCounter,
  (counter, dispatch, resolve) => {
    /*...*/
  },
)

const myAction = function() {
  return (dispatch: Dispatch, resolve: Resolve) => {
    /*...*/
  }
}
```
