# Routing Library

> declarative routing that just works

```javascript
function MyRouter(){
    return useRouter({

        // basic usage matches paths to components
        login: <Login/>,

        // nested routers
        home: {

            // named parameters
            ':user': <User/>,

            // arbitrary route logic
            profile: () => {
                if(loggedIn()){
                    return <Profile/>
                } else {
                    return '/login'
                }
            },
        }

        // supports Promises for eager loading
        edit: import('./Edit').then(({ Edit }) => <Edit/>)

        // supports Promises for lazy loading
        inbox: async () => {
            const { Inbox } = await import('./Inbox')
            return <Inbox/>
        }

        // reroute using strings
        '': '/home',

    })
}
```

## TODO:

- exact vs loose matches
- hook for url information
