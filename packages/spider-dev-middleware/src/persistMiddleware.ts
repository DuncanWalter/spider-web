import { Middleware } from '@dwalter/spider-store'
import { aggregateState, throttle } from './utils'

interface PersistMiddlwareConfig {
  throttleMilliseconds: number
}

export function createPersistMiddleware({
  throttleMilliseconds = 1000,
}: Partial<PersistMiddlwareConfig> = {}) {
  const persistMiddleware: Middleware = (store, { dispatch, wrapReducer }) => {
    if (sessionStorage) {
      try {
        let state: { [name: string]: unknown } = {}

        const serializedState = sessionStorage.getItem('@@spider-store-state')

        if (serializedState != null) {
          state = JSON.parse(serializedState)
        }

        const recordState = throttle(() => {
          Object.assign(state, aggregateState(store))

          try {
            sessionStorage.setItem(
              '@@spider-store-state',
              JSON.stringify(state),
            )
          } catch (error) {
            console.error(error)
          }
        }, throttleMilliseconds)

        return {
          dispatch(actions) {
            dispatch(actions)
            recordState()
          },
          wrapReducer(reducer) {
            if (!store.slices.has(reducer)) {
              const slice = wrapReducer(reducer)
              if (Object.hasOwnProperty.call(state, reducer.name)) {
                slice.setState(state[reducer.name] as any)
              }
              return slice
            }
            return wrapReducer(reducer)
          },
        }
      } catch (error) {
        console.error(error)
      }
    }
    return {}
  }
  return persistMiddleware
}
