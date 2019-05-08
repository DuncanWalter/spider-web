# Routing Library

> Declarative routing that just works.

Exports a Provider Component:

```javascript
import { createHashHistory } from 'history'

function App() {
  return (
    <Provider history={createHashHistory()}>
      <MyRouter />
    </Provider>
  )
}
```

Exports two React hooks:

- `useRouter()`: Declare a router which acts as a switch on URL state
- `useHistory()`: Get access to path parameters or navigation methods

```javascript
function MyRouter() {
  return useRouter({
    // basic usage matches paths to components
    login: <Login />,

    // supports nested routers
    home: {
      // supports arbitrary route logic
      profile() {
        if (loggedIn()) {
          return <Profile />
        } else {
          return '/login'
        }
      },

      // supports named parameters
      ':user': ({ params }) => <User user={params.user} />,

      // supports exact and loose matching
      about: ({ exact }) => (exact ? <About /> : null),
    },

    // supports Promises for eager loading
    edit: import('./Edit').then(({ Edit }) => <Edit />),

    // supports Promises for lazy loading
    async inbox() {
      const { Inbox } = await import('./Inbox')
      return <Inbox />
    },

    // supports defaults and rerouting
    '': '/home',
  })
}
```

## TypeScript

Written in TypeScript and shipped with type definitions.

## TODO:

- exact vs loose matches ✅
- hook for url information ✅
- prevent potential errors caused by async mutation with promises
- allow for recovery from null routes for more intuitive use
- hook into store support? Maybe not useful...
- exact helper function?
