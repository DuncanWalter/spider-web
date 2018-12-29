# TODO

- optimise `action.target` for fast setters?
- clean up enhancer API (`store.with(asyncActionsEnhancer()).with(wrapStateEnhancer())`)
- create those two enhancers
- get rid of the redundant render in useSlice (on first call)
- enhancers need to be passed the create store function, I guess... (thats a separate react-spider API, realistically)

# Redux

- combineReducers
- applyMiddleware
- createStore
  - dispatch
  - getState
  - subscribe

# Spider

- createSettableReducer
- joinSlices
- createStore
  - wrapReducer
  - dispatch
- Slice
  - use
  - subscribe
