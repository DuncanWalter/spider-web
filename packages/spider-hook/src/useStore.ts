import { useContext } from 'react'
import { StoreContext } from './SpiderRoot'

export function useStore() {
  return useContext(StoreContext)
}
