# useSelector()

`ueSelector` is a React hook used to read the contents of a reducer or selector within a component. The hook also handles all the subscription and update logic for you, so the component will automatically update to reflect the latest state.

## Arguments

- **source**: the source to subscribe to and resolve.

## Returns

The content of the **source** argument.

## Examples

In the following example, `MyComponent` will automatically update when the value of `getCounter` changes.

```javascript
function MyComponent() {
  const counter = useSelector(getCounter)

  return <div>{counter}</div>
}
```

Any given reducer or selector has exactly one valid state per store state and only updates a maximum of one time per store state. Additionally, updates to multiple reducers or selectors as a result of synchronous store changes are grouped. So, components will update the absolute minimum required number of times to reflect store state from a user perspective.
