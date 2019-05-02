import { useContext } from 'react'
import { StoreContext } from './SpiderRoot'

export function useDispatch() {
  const { hookDispatch: dispatch } = useContext(StoreContext)
  return dispatch
}
