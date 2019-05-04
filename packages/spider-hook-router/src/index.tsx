import { Provider } from './Provider'
import { useHistory, useRouter } from './push'

export { Provider }
export { useHistory, useRouter }

// import { createBrowserHistory, History, Location, Action } from 'history'
// import React, { useContext, useEffect, ReactElement } from 'react'
// import {
//   Action as SpiderAction,
//   useActions,
//   useSelector,
// } from '@dwalter/spider-hook'

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
