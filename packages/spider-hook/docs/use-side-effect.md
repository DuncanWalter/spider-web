# useSideEffect()

Once you have a side effect object from `createSideEffect()`, you can subscribe it to a store using the React hook `useSideEffect()`. `useSideEffect()` automatically handles subscribing and unsubscribing from the store. The hook also ensures that the same side effect is never subscribed to a single store multiple times at once. In other words, the side effect is guaranteed to only run once per relevant state change.

## Arguments

**sideEffect**: The side effect to subscribe to the app's state store. The side effect should be one created by the `createSideEffect()` function.

## Examples

`useSideEffect()` returns undefined, so it really is as simple as passing a side effect object into the hook function.

```javascript
function MyComponent() {
  useSideEffect(someSideEffect)

  return <div>{/*...*/}</div>
}
```
