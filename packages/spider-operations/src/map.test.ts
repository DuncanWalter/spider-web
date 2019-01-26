import { createStore } from '@dwalter/spider-store'
import { map } from './map'

test('Slices can be mapped properly', () => {
  const { wrapReducer } = createStore()
  const counter = wrapReducer<number>((state = 0) => state + 1)

  counter
    .use(map)
    .map(i => 3 * i)
    .map(i => 2 * i)
    .map(i => 1 + i)
    .map(i => i.toFixed(0))
    .subscribe(i => expect(i).toBe('7'))
})
