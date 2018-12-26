import { Store, getMaster } from './createStore'

export function mergeStores(master: Store<any>, child: Store<any>) {
  const newMaster = getMaster(master)
  const oldMaster = getMaster(child)
  oldMaster.master = newMaster
  if (newMaster.slices.indexOf(oldMaster.slices[0]) < 0) {
    newMaster.slices = newMaster.slices.concat(oldMaster.slices)
  }
  oldMaster.slices = []
}
