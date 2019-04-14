# createSelector()

Selectors are for combining and interpreting low level slices of state. When state changes or components rerender, a selector will only update if its underlying value changes. In `spider-hook`, reducers are essentially a special type of selector that listens directly to a store. By convention, both selectors and reducers are prefixed with `get`.

For more information, you can refer to the `createSelector()` function of `reselect`. However, these two implementations are strikingly different under the hood.

## Arguments

- **sources**: an array of reducers or selectors to select from.
- **mapping**: a function mapping from the contents of the **sources** to the contents of the created selector.

## Returns

A selector object.

## Examples

The **sources** argument treats reducers and selectors interchangeably; in the following example, `getCounter` could be either a reducer or a selector.

```javascript
const getDoubledCounter = createSelector(
  [getCounter],
  counter => 2 * counter,
)
```

The values stored in selectors do not need to be serializable because they will never be logged or added to the store state. When returning non-primitives, try to pre-allocate the possible returns where possible. This reduces the amount of memory allocated when state changes and allows `spider-hook` to make more optimizations.

```javascript
const getFilterFunction = createSelector(
  [getFilterMode],
  filterMode => {
    switch(filterMode){
      case 'all': return viewAll,
      case 'done': return viewDone,
      /*...*/
    }
  },
)

function viewAll(){
  return true
}

function viewDone(todo){
  return todo.done
}

/*...*/
```

`createSelector()` is often used in conjunction with the `tuple()` function when combining multiple state slices. `tuple()` preserves type inference thanks to features added in `typescript` in the 3.0 release. Without the `tuple()` function, `typescript` will read the **sources** argument as a list of a union type rather than as a tuple.

```javascript
const getVisibleTodos = createSelctor(
  tuple(getTodos, getFilterFunction),
  (todos, filterFunction) => todos.filter(filterFunction),
)
```
