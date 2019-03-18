# spider-hook

`spider-hook` is a library which integrates `@dwalter/spider-store` and `react` via the hooks API.

While `spider-hook` is in many ways analogous to `react-redux`, it has a few differences. For starters, `spider-hook` is less than half the size of `react-redux`. Next, projects should not depend separately on `spider-store` and `spider-hook`; `spider-hook` already depends on `spider-hook` and reexports anything that you might need.

## Store Injection

`spider-hook` exports an app root component `SpiderRoot` which provides a configurable state store to the application in a safe and controlled manner.

## Creating Selectors

Selectors are a familiar idea in `react`.

`createSelector()`

## Subscribing to State

`useSelector()`

## Action Binding

`useActions()`

## Side Effects

`createSideEffect()`
`useSideEffect()`

## Boosting Performance

`Fork` component
