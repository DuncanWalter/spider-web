// import { createStore, utils } from '@dwalter/spider-store'
// import { map, fork } from '.'

// test('Slices can be forked successfully', async done => {
//   const { dispatch, wrapReducer } = createStore()

//   const slice = wrapReducer<number[]>((state = [], action) => {
//     switch (action.type) {
//       case 'add': {
//         return [state.length, ...state]
//       }
//       case 'cull': {
//         return state.filter(i => i % 2)
//       }
//       default: {
//         return state
//       }
//     }
//   })
//     .use(fork, map)
//     .fork(s => s.map(v => -1 * v))

//   expect(resolveSlice(slice).length).toBe(0)

//   await dispatch({ type: 'add' })

//   const [innerSlice] = resolveSlice(slice)

//   expect(resolveSlice(innerSlice)).toBe(-0)

//   await dispatch({ type: 'add' })

//   const [nextSlice] = resolveSlice(slice)

//   expect(nextSlice === innerSlice).toBeTruthy()

//   expect(resolveSlice(innerSlice)).toBe(-1)

//   await dispatch({ type: 'cull' })

//   done()
// })
