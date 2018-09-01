# spider-web

Experimenting with state management for applications benefiting from:

- Frequently updating state slices (~50Hz+)
- Dynamically loaded state interactions
- Dynamically created instances of state slices
- Mutating state slices
- Rarely used state slices

Not yet considered:

- Extensibility and middleware
- Incremental adoption
- Snapshot / time-travel support

```javascript
const bigRandom = declareResource({
  mapping: () => Math.random(),
  volatile: true,
}).map(r => r * 10)
```
