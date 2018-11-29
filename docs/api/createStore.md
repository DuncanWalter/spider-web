# createStore()

`createStore()` is the entry point of the `spider-web` api. `createStore()` accepts no arguments and returns a new state store which is completely isolated from other stores. Later, middleware support may be added to extend the capabilities of state stores.

## Returns:

Returns a POJO with [dispatch()](./dispatch.md) and [wrapReducer()](./wrapReducer.md) properties.

```javascript
interface Store<Action extends { type: string }> {
    dispatch: Dispatch<Action>,
    wrapReducer: WrapReducer<Action>,
}
```
