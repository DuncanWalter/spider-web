// import { createBrowserHistory, History, Location, Action } from 'history'
// import React, { useContext, useEffect, ReactElement } from 'react'
// import {
//   Action as SpiderAction,
//   useActions,
//   useSelector,
// } from '@dwalter/spider-hook'
// import pathToRegexp from 'path-to-regexp'

// type Route<R> = R | Router<R>
// type Async<T> = T | Promise<T> | (() => T) | (() => Promise<T>)
// type Router<R> = { [path: string]: string | Async<Route<R>> }

// interface ResolutionContext<R> {
//   path: string
//   match: string

//   params: { [param: string]: string }

//   push(path: string): unknown

//   isRoute(route: Async<Route<R>>): route is R
//   // interpretRoute(ctx: ResolutionContext<R>): R | Promise<R>
//   // selectRoute(ctx: ResolutionContext<R>): R | Promise<R>

//   router: Router<R>
// }

// interface HistoryState {
//   location: Location
//   action: Action
// }

// interface HistoryAction extends SpiderAction {
//   type: '@history/update-history'
//   location: Location
//   action: Action
// }

// const HistoryContext = React.createContext<null | History>(null)

// interface HistoryProviderProps {
//   history?: History
//   children: React.ReactNode
// }

// function historyReducer(
//   state = null as HistoryState | null,
//   { type, action, location }: HistoryAction,
// ) {
//   if (type === '@history/update-history') {
//     return { action, location }
//   }
//   return state
// }

// function updateHistory(location: Location, action: Action): HistoryAction {
//   return {
//     type: '@history/update-history',
//     location,
//     action,
//     reducers: [historyReducer],
//   }
// }

// function HistoryProvider({
//   history = createBrowserHistory(),
//   children,
// }: HistoryProviderProps) {
//   const actions = useActions({ updateHistory })

//   useEffect(() => {
//     actions.updateHistory(history.location, history.action)
//     return history.listen(actions.updateHistory)
//   }, [])

//   useSelector(historyReducer)

//   return (
//     <HistoryContext.Provider value={history}>
//       {children}
//     </HistoryContext.Provider>
//   )
// }

// function useHistory() {
//   return useContext(HistoryContext)
// }

// function useRouter(
//   // match: string | Match,
//   router: Router<ReactElement>,
//   fallback?: React.ReactNode,
// ) {
//   const history = useHistory()

//   if (history === null) {
//     // TODO: awfulness incarnate
//     return undefined as never
//   }

//   const { pathname, search, hash } = history.location

//   Object.keys(router).find(path => {
//     const parse = pathToRegexp(`${match}${path}`).exec(
//       `${pathname}${search}${hash}`,
//     )
//     console.log(parse)
//     return !!parse
//   })
// }

// function interpret<T>(
//   route: Async<Route<T>>,
//   isRoute: (arg: Async<Route<T>>) => arg is T,
// ): T {
//   if (isRoute(route)) {
//     return route
//   }
//   if (typeof route === 'string') {
//     // push
//   }
//   if (typeof route === 'function') {
//     return interpret(route(), isRoute)
//   }
//   if (Promise && route instanceof Promise) {
//     return route.then(interpret)
//   }
//   if (typeof route === 'object') {
//     if ('$$typeof' in route) {
//       return route
//     } else {
//       // TODO: recurse into the router switch
//     }
//   }
//   if (typeof route === 'string') {
//   }
// }

// function selectRoute<T>(ctx: ResolutionContext<T>) {
//   const { router, isRoute, path, match, push } = ctx

//   for (let routerPath of Object.keys(router)) {
//     const pattern = pathToRegexp(`${routerPath}`)
//     const parse = pattern.exec(path)
//     if (parse) {
//       const [match, ...parameters] = parse
//       const remainingPath = path.slice(match.length)

//       const route = router[routerPath]

//       if (typeof route === 'string') {
//         replace(route)
//         return null
//       } else if (isRoute(route)) {
//         return route
//       } else {
//       }
//     }

//     console.log(parse)
//     return !!parse
//   }
// }
