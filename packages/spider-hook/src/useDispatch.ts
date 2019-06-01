import { useContext } from 'react'
import { StoreContext } from './Provider'

export function useDispatch() {
  return useContext(StoreContext).dispatch
}
