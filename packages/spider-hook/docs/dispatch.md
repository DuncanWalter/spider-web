# dispatch()

There is a lineage of state store technologies which make use of `dispatch()` functions to control when state changes. The basic idea is that state only updates when an action is passed to the `dispatch()` function. This pattern makes it possible to keep a history of all the actions it would take to recreate the current store state. It also means that control over store state mutations can be limited by restricting access to the `dispatch()` function.

This makes for very predictable state mutations, but a `dispatch()` function which synchronously dispatches a single action is unwieldy in many real world use cases. Firstly, it does not have any concept of asynchronously occurring events. For example, actions need to be dispatched due to server responses- `dispatch()` offers no intuitive way of achieving that effect. Secondly, it can be problematic when many actions are dispatched in quick succession and page updates trigger as a result of each one. This causes a lot of unnecessary churn in view state that could have been avoided by waiting until state mutations were finished. Lastly, `dispatch()` is a dangerous function. If `dispatch()` is called again before the last call to `dispatch()` returns, most of the benefits of using `dispatch()` evaporate: the action history is no longer valid, and tracing state changes becomes extremely difficult.

Over time, `dispatch()` has been adapted to address these pain points. To handle asynchronous dispatches gracefully, the `redux` community developed `redux-thunk` and the concept of 'thunk actions.' The idea is that when `dispatch()` is passed a function instead of a traditional action, `dispatch()` will pass itself to that function. Paired with Promises and async functions, these thunk actions make scheduling asynchronous dispatches easy. Libraries like `redux` and `reselect` partially address the problem of view state churn by updating asynchronously and caching. `spider-store` goes one step further and allows traditional actions to be dispatched in a group which only triggers a single update to subscribers. And finally, in `spider-store` nested calls to `dispatch()` are unstacked; that means they are forced to run in sequence.

The `dispatch()` function you will encounter in `spider-hook` has all these additional features. This means you can define thunk actions and make dispatches from within side effects.

## Examples

```javascript
function someThunkAction(someData) {
  return async (dispatch: Dispatch) => {
    dispatch(lowLevelAction1())

    const response = await fetch(someData)

    dispatch(lowLevelAction2(response))
  }
}

function someGroupedAction() {
  return [
    lowLevelAction1(),
    [lowLevelAction3(1), lowLevelAction3(2), lowLevelAction4()],
  ]
}
```
