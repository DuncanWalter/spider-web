# Slice

A `spider-web` `Slice` represents a slice or view of state originating from one or many state stores. Slices can be combined and subscribed to in way resembling observables. However, observables are not ideal for state management because they can 'glitch' and produce extra, invalid state views. A `Slice` has exactly one valid value per state of its parents and will never duplicate work.

## Construction:

The best way to create a `Slice` from scratch is using the [wrapReducer()](./wrapReducer.md) function attached to a state store.

```javascript
const counter: Slice<number> = wrapReducer((state = 0, action) => {
  switch (action.type) {
    case '@counter/increment':
      return state + 1
    case '@counter/decrement':
      return state - 1
    default:
      return state
  }
})
```

## How is this different from observables?

In blog-speak, there are 3 main differences between `spider-web` state slices and `rxjs`-style observables.

1. `spider-web` state slices always have a single, valid state that can be synchronously retrieved. This is somewhat similar to `rxjs` behavior-subjects. However, behavior-subjects' values are eagerly updated when subscribed and otherwise ignored. `spider-web` state slices compute their content only when requested and then cache; this saves computations while allowing all state slices to have a valid state.

2. `rxjs` is not designed to solve what is sometimes called the 'diamond' problem. The diamond problem occurs when a destination observable subscribes to multiple observables which in turn subscribe to the same root observable. When the shared root pushes a new value, the destination observable will push two new values in quick succession. The first value pushed will not be valid. This is sometimes called 'glitching.' Glitching is fine for many use cases of observables, but problematic for observing state from a 'single source of truth.' Because all `spider-web` state slices are tied to a store, `spider-web` is able to efficiently handle the diamond problem; the destination state slice in all diamond cases will only push a single, valid value.

3. `spider-web` state slices never 'complete' in the sense that an `rxjs` observable can. State never runs out or ends, so there is no need for a state slice to either.
