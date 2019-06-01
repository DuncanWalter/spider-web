import { useContext } from 'react'
import { StoreContext } from './Provider'

export function useStore() {
  return useContext(StoreContext)
}
