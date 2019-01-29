# TODO

- Demo app

- Should side effects be run async?
- Make side effects run last in a propagation (depth = max int)

- laws of dispatch
  - when multiple actions are dispatched at once, all actions are run before propagating
  - propagation occurs after every dispatch of actions
  - subscriptions are all run synchronously after propagation
  - calls to dispatch are unstacked?

# Redux

- combineReducers
- applyMiddleware
- createStore
  - dispatch
  - getState
  - subscribe

# Spider

- createSettableState
- mergeSlices
- joinSlices
- createStore
  - wrapReducer
  - dispatch
- Slice
  - use
  - subscribe
