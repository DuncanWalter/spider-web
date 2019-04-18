# tuple()

The **sources** parameter of `createSelector()` is most accurately of a tuple type. However, Typescript will interpret it as an array of a union type by default. This is usually a good behavior, but it is a pain when calling `createSelector()`. The `tuple()` function is a one line utility function that tells Typescript to interpret an array as a tuple, so you can call `createSelector()` more easily.

## Arguments

**items**: A variadic argument list of items.

## Returns

The **items** argument as an array with a tuple type.

## Examples

In the following example, `tuple(getBar, getBaz)` replaces `[getBar, getBaz]`. If you were to use the array instead of the `tuple()` function, Typescript would not allow you to access the type-specific properties of `bar` and `baz`.

```javascript
const getFoo = createSelector(
  tuple(getBar, getBaz),
  (bar, baz) => bar.someBarProp(baz.someBazProp),
)
```
