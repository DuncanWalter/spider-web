# TODO

- Demo app

- Make a slice of actions that propagates with state updates (propagates lists of actions)

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

- mergeSlices
- joinSlices
- createStore
  - wrapReducer
  - dispatch
- Slice

  - use
  - subscribe

- createSettableState
