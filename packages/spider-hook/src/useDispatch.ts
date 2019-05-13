import { useContext } from 'react'
import { StoreContext } from './SpiderRoot'

export function useDispatch() {
  return useContext(StoreContext).dispatch
}
