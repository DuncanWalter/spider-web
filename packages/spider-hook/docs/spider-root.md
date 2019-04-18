# SpiderRoot

Under the hood, `spider-hook` is unsurprisingly using the React context API to provide store access to components. However, to make `spider-hook` safe for use cases like server side rendering and allow for store configuration, `spider-hook` does not have an internal singleton store. Instead, `spider-hook` keeps track of a separate store for each React application. This means that each React application needs to declare and configure a state store at its root. `SpiderRoot` is a component which does exactly that.

## Props

**configureStore**: An optional function which takes no arguments and returns a spider state store. In theory, this is used to set up logging services.

## Examples

Typically, the `SpiderRoot` function will be used exactly once in a component which is nearly the application root.

```javascript
function App() {
  return (
    <SpiderRoot>
      <AppRouter />
    </SpiderRoot>
  )
}
```
