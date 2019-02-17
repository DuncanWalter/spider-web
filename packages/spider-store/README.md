# @dwalter/spider-store

An agnostic state store library with 'pseudo-observables' and a bottom-up approach to state management. `spider-store` attempts to preserve the simplicity and determinism of `redux` while also addressing some of its pain points.

## Ecosystem Comparisons

`spider-store` is about two thirds the size of `redux` and uses the same general reducer, action, and dispatch architecture. `spider-store` does _**not**_ take after libraries like `mobx` and `vuex` which mangle state objects. While somewhat inspired by `ngrx`, `spider-store` is as dissimilar to `ngrx` as to `redux`. At high level, one can think of `spider-store` as an alternative to the combination of `redux`, `redux-thunk`, and `reselect` with built in `typescript` support and a canonical strategy for dynamic loading. `spider-store` is supported on the same browsers as `react` (based on the use of es5 `Map`s and `rollup` configurations).

## Pseudo-Observable

TODO: Basically, a `Slice` always has exactly one valid state, only updates when absolutely necessary, and resolves any diamond dependencies automatically. These are helpful properties for state management, and make `spider-store`s as predictable as `redux` stores.

## API

There are two primary exports of `spider-store`: `createStore()` and `joinSlices()`.

#### `createStore()`

Creates a plain javascript object with `dispatch()`, `resolve()`, and `wrapReducer()` properties. These properties do not rely on the `this` reference, and can therefore be passed freely without any reference to the store. That said, the three functions are for only that state store; actions dispatched to one store will not have an impact on any other store and state cannot be retrieved by a foreign `resolve()` function.

#### `wrapReducer()`

Accepts a reducer function as an argument and returns a `Slice` of state. The same reducer cannot be wrapped by the same store twice- an attempt to do so will return a reference to the `Slice` created the first time the reducer was wrapped.

#### `dispatch()`

The dispatcher function in `spider-store` is the only way to update state. Traditionally, `dispatch()` is a function which accepts an action, applies changes to state, and returns nothing. `redux-thunk` has popularized a second call signature for dispatchers; `dispatch()` may also be called with a function. In this case, `dispatch()` calls the given function with a reference to `dispatch()` and a reference to `resolve()` then returns whatever the function does. Additionally, `dispatch()` can be called with a generalized list of actions (`type List<Action> = Action | List<Action>[]`) to apply the changes from multiple actions to state atomically before propagating those changes.

Calls to dispatch are resolved synchronously, and any state changes are propagated before `dispatch()` returns.

`dispatch()` should not be called from within reducers or the evaluation functions of a `Slice`. However, `dispatch()` may be called freely from within callbacks subscribed to state changes or anywhere else.

Recursive calls to `dispatch()` are automatically flattened, forcing them to run in the order called after the current call to `dispatch()` completes. This is why it is safe to use `dispatch()` within subscribed callbacks, but beware of creating infinite loops.

#### `resolve()`

`resolve()` accepts either a reducer or a `Slice` and returns the state conceptually contained by this argument.

`resolve()` should not be called from within reducers or the evaluation functions of a `Slice`. However, `resolve()` may be called freely from within callbacks subscribed to state changes or anywhere else.

#### `Slice<T>`

A `Slice` is a pseudo-observable representing a part of state or some representation of state. `Slices` have two primary properties: `Slice.subscribe()` and `Slice.use()`.

`Slice.subscribe()` attaches a callback to any change in the underlying value of the `Slice` and returns a subscription. `Slice`s are not updated if they are not a dependency for at least one subscription, so it is important to call the sister function `Slice.unsubscribe()` with the subscription when the attached callback is no longer being used. Attached callbacks are called synchronously when relevant state changes, but not in any particular order.

`Slice.use()` attaches operations to the `Slice` which mirror lettable operators from observable libraries like `rxjs`.

#### `joinSlices()`

`joinSlices()`, much like `createSelector()` from `reselect`, accepts any number of slices as arguments followed by a function which accepts the contents of each of those slices in order. Note that `joinSlices()` is variadic as opposed to accepting an array for the first argument.
