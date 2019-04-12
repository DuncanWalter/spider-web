import { useContext } from 'react'
import { StoreContext } from './SpiderRoot'

/**
 * `useStore()` is an escape hatch which should
 * not be used. `useStore()` retrieves the state
 * store of the application.
 */
export function useStore() {
  return useContext(StoreContext)
}
