import { createStore } from '.'

const { dispatch, wrapReducer } = createStore()

const leftCounter = wrapReducer((i: number = 0) => ++i)
const rightCounter = wrapReducer((i: number = 0) => ++i)
