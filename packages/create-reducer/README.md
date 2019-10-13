# @dwalter/create-reducer

`create-reducer` is a tiny (1kb) utility for declaring strongly typed, reusable reducer logic. If you know [robodux](https://github.com/neurosnap/robodux), `create-reducer` will feel like a variation on a familiar theme.

## What is a Reducer?

A reducer is a pure function which takes a state and an action as arguments and produces a new state. Typically, reducers also provide some sort of initial state in the form of a default state argument. By convention, reducers use a switch statement on the `type` property of the action argument to determine which logic to execute.

Here's an example of how a reducer and some associated actions might be declared in `typescript` without any utility libraries:

```javascript
interface IncrementCounter {
  type: '@counter/increment'
}

interface DecrementCounter {
  type: '@counter/decrement'
}

interface SetCounter {
  type: '@counter/set'
  value: number
}

type CounterAction = IncrementCounter | DecrementCounter | SetCounter

const actions = {
  increment(): IncrementCounter {
    return { type: '@counter/increment' }
  },
  decrement(): DecrementCounter {
    return { type: '@counter/decrement' }
  },
  set(value): SetCounter {
    return { type: '@counter/set', value }
  },
}

function counter(state = 0, action: CounterAction) {
  switch (action.type) {
    case '@counter/increment':
      return state + 1
    case '@counter/decrement':
      return state - 1
    case '@counter/set':
      return action.value
    default:
      return state
  }
}
```

Reducers are both declarative and simple. This makes them desireable for state management purposes. However, no pattern is perfect. Reducers have a few pain points- particularly when used with certain modern tools. `create-reducer` attempts to address three of these common problems in particular:

- When using type systems, all actions need their types declared and put into a union in order for static analysis to work properly within reducers. This isn't an obscene amount of boilerplate, but it is a noticeable chore.
- When using linting rules which disallow shadowed variable names, variables used in switch cases often need to be hoisted due to changes in seemingly unrelated code. When paired with a type system, this often also means manually typing the variable instead of relying on type inference.
- Oftentimes, several reducers will have similar logic with slightly different action `type` properties. Naively, this means remaking the same logic in each reducer. There are several approaches to combat this duplication. Higher order reducers have been introduced for remaking similar logic with factory methods, though higher order reducers do not allow the resulting reducer logic to be extended in any way. Reducer composition is another potential workaround, but it is unclear how actions for composed reducers could be made reusable without introducing pitfalls and gotchas.

## Using `createReducer()`

The core of `create-reducer` is a function called `createReducer()`. `createReducer()` takes three parameters: a prefix for generated actions, an initial state, and an object with handlers describing all the behaviors of the desired reducer. Notice that the first parameter of each handler is the current state and that the remaining parameters correspond to the parameters of the associated action creator. `createReducer()` returns a pair containing the reducer function and a collection of action creators in the same shape as the handler object passed in.

Here's an example of declaring the same reducer from the above example using `createReducer()` in `typescript`:

```javascript
import { createReducer } from '@dwalter/create-reducer'

const [counter, actions] = createReducer('counter', 0, {
  increment(state) {
    return state + 1
  },
  decrement(state) {
    return state - 1
  },
  set(_, value: number) {
    return value
  },
})
```

Note that event though no actions are explicitly typed, `typescript` knows the call signatures of all action creator props on the `actions` variable. Also, each handler has its own function scope, so variable hoisting is no longer an issue.

## Custom Action Types

When passed a string in the first parameter, `createReducer()` generates action types using the property names of the handlers as shown in the first example (`` `@${prefix}/${handlerName}` ``). It is also possible to pass a function which accepts a handler name and returns an action type string if you need more control over the generated action types.

## Reducer Mixins

So how does `create-reducer` help with reusing reducer logic? Let's imagine we need several pieces of state to be tracked which are arrays. We'll want actions for common array operations in all of them, but we don't want to redeclare the same actions and reducer logic multiple times. So, we declare a reducer mixin as follows:

```javascript
const arraylike = {
  add(state, item) {
    /* Reducer Logic */
  },
  remove(state, item) {
    /* Reducer Logic */
  },
  set(state, index, item) {
    /* Reducer Logic */
  },
}
```

There are several ways to then use a reducer mixin. Most of the time, you will probably want to add more functionality to the reducer in addition to the utility provided by the mixin. Sometimes it may even be useful to withhold or rename handlers from the mixin:

```javascript
const [fooReducer, fooActions] = createReducer('foo', [], arraylike)

const [barReducer, barActions] = createReducer('bar', [], {
  ...arraylike,
  someOtherAction(state, ...payload) {
    /* Reducer Logic */
  },
})

const [bazReducer, bazActions] = createReducer('baz', [], {
  setBaz: arraylike.set,
  yetAnotherAction(state, ...payload) {
    /* Reducer Logic */
  },
})
```

Notice that these mixin examples are done in javascript without type safety. To use mixins in `typescript` effectively, the mixins must include some notion of generics. This is why the mixins provided by `create-reducer` are all functions, not objects:

```javascript
import { createReducer, arraylike } from '@dwalter/create-reducer'

createReducer('foobar', [], {
  ...arraylike<number>(),
  fooTheBar(state, ...payload) {
    /* Reducer Logic */
  },
})
```

## Built in Mixins

`create-reducer` ships with a few basic mixins out of the box. They are not special or unique mixins in any way, so they can be treeshaken from your bundle if not used.

#### `settable<T>()`

Adds a single action creator `set()` which accepts a new value for that piece of state.

```javascript
const [name, nameActions] = createReducer('name', 'Orolo', {
  ...settable<string>()
})

let state = name(undefined, {})

function dispatch(action: Action){
  state = name(state, action)
}

dispatch(nameActions.set('Erasmus'))
```

#### `arraylike<T>()`

Adds several array operations.

```javascript
const [numbers, numberActions] = createReducer('numbers', [], {
  ...arraylike<number>()
})

let state = numbers(undefined, {})

function dispatch(action: Action){
  state = numbers(state, action)
}

dispatch(numberActions.add(1))

dispatch(numberActions.add(2))

dispatch(numberActions.set(0, 4))

// supports negative indices
dispatch(numberActions.set(-1, 4))

// removes the first occurrence
// of an element
dispatch(numberActions.remove(4))

// removes the element at a
// certain index (also supports
// negative indices)
dispatch(numberActions.delete(-1))
```

#### `entityTable<T>()`

Made for storing entity objects which have some sort of id (and typically shouldn't be represented twice in state). This type of normalization logic is handy both for making caches and for managing memory usage.

```javascript
interface Foo {
  id: number
  name: string
}

const [foos, fooActions] = createReducer('foo', {}, {
  // the table can be configured to hash
  // however you need it to
  ...entityTable<Foo>(foo => foo.id)
})

let state = foos(undefined, {})

function dispatch(action: Action){
  state = foos(state, action)
}

// add is the only way to add an entity to
// the table
dispatch(fooActions.add({ id: 2, name: 'bill' }))

// increments the reference count to the
// entity with id 2
dispatch(fooActions.add({ id: 2, name: 'bill' }))

// entity's reference count is decremented,
// but it was referenced twice to it is not
// removed
dispatch(fooActions.remove({ id: 2, name: 'bill' }))

// updates the entity with id 2
dispatch(fooActions.update({ id: 2, name: 'ted' }))

// entity's reference count is decremented,
// and this time it is removed
dispatch(fooActions.remove({ id: 2, name: 'ted' }))

// does nothing because the entity is not
// being tracked anymore
dispatch(fooActions.update({ id: 2, name: 'ted' }))
```

## Questions

#### Does `create-reducer` come with support for thunk and/or async actions?

Yes and no? This library only deals with plain object actions. However, these actions can be dispatched freely from within other actionlike abstractions. these features have more to do with the dispatch function than with the reducers, so `create-reducer` opts not to deal with them internally.

#### Why do the type signatures of the generated action creators include a `reducers` prop in the returned actions?

That prop is there for compatibility with `@dwalter/spider-store`, which this library was originally spawned from. The `reducers` prop is in a prototype of the generated actions, so it won't show up in `redux-dev-tools` or break any behaviors of `redux`.
