// import { Action } from '@dwalter/spider-store'
// import { tuple } from './tuple'

// interface AddItem<Item> extends Action {
//   type: '@array/add-item'
//   item: Item
// }

// interface RemoveItem<Item> extends Action {
//   type: '@array/remove-item'
//   item: Item
// }

// interface SetIndex<Item> extends Action {
//   type: '@array/set-index'
//   index: number
//   item: Item
// }

// interface RemoveIndex<Item> extends Action {
//   type: '@array/remove-index'
//   index: number
// }

// type ArrayAction<Item> =
//   | AddItem<Item>
//   | RemoveItem<Item>
//   | RemoveIndex<Item>
//   | SetIndex<Item>

// /**
//  * Creates a reducer and several actions for
//  * an array of elements in state.
//  */
// export function createArrayState<Item>() {
//   const reducers = [reducer]
//   function reducer(state: Item[] = [], action: ArrayAction<Item>) {
//     const newState = state.slice()
//     switch (action.type) {
//       case '@array/add-item':
//         newState.push(action.item)
//         return newState
//       case '@array/remove-index':
//         newState.splice(action.index, 1)
//         return newState
//       case '@array/remove-item':
//         return newState.filter(item => item !== action.item)
//       case '@array/set-index':
//         newState[action.index] = action.item
//         return newState
//       default:
//         return state
//     }
//   }

//   return tuple(reducer, {
//     add(item: Item): AddItem<Item> {
//       return { type: '@array/add-item', item, reducers }
//     },
//     remove(item: Item): RemoveItem<Item> {
//       return { type: '@array/remove-item', item, reducers }
//     },
//     delete(index: number): RemoveIndex<Item> {
//       return { type: '@array/remove-index', index, reducers }
//     },
//     update(index: number, item: Item): SetIndex<Item> {
//       return { type: '@array/update', index, item, reducers }
//     },
//     set(newState: Item[]) {
//       return { type: '@array/set', newState, reducers }
//     },
//   })
// }

export function arrayReducerBehavior<Item>() {
  return {
    add(state: Item[], item: Item) {
      const newState = state.slice()
      newState.push(item)
      return newState
    },
    delete(state: Item[], index: number) {
      const length = state.length
      if (length <= index || index < -length) {
        return state
      }
      const newState = state.slice()
      newState.splice((index + length) % length, 1)
      return newState
    },
    remove(state: Item[], item: Item) {
      const index = state.indexOf(item)
      if (index < 0) {
        return state
      }
      const newState = state.slice()
      newState.splice(index, 1)
      return newState
    },
    update(state: Item[], index: number, item: Item) {
      const length = state.length
      if (length <= index || index < -length) {
        return state
      }
      const newState = state.slice()
      newState[(index + length) % length] = item
      return newState
    },
  }
}
