import { Store, getMaster } from './createStore'

export function mergeStores(...stores: Store<any>[]) {
  if (stores.length <= 1) {
    return
  }

  const [master, ...children] = stores

  children.forEach(child => {
    const oldMaster = getMaster(child)
    oldMaster.master = master
    if (master.slices.indexOf(oldMaster.slices[0]) < 0) {
      master.slices.push(...oldMaster.slices)
    }
  })
}
