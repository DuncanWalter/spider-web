# TODO

- Demo app

- laws of dispatch
  - when multiple actions are dispatched at once, all actions are run before propagating
  - propagation occurs after every dispatch of actions
  - subscriptions are all run synchronously after propagation (in an unknown order)
  - calls to dispatch are unstacked

# Redux

- combineReducers
- applyMiddleware
- createStore
  - dispatch
  - getState
  - subscribe

# Spider

- joinSlices
- createStore
  - wrapReducer
  - dispatch
    - resolve
- Slice
  - use
  - subscribe
