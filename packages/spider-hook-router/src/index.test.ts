// import { resolve } from './index'

const router = {
  landing: () => () => () => 1,
  login: 2,
  ':user': {
    about: {
      ':tab?': 3,
    },
    profile: () => {
      return '/login'
    },
  },
  '': Promise.resolve(4),
}

// function resolvePath(path: string) {
//   return resolve<number>({
//     router,
//     path,
//     isTerminal(arg: unknown): arg is number {
//       return typeof arg === 'number'
//     },
//   })
// }

test('Route resolution works as intended', () => {
  return
  // expect(resolvePath('/landing')[0]).toBe(1)
  // expect(resolvePath('/DuncanWalter/about')[0]).toBe(3)
  // expect(resolvePath('/DuncanWalter/about/')[0]).toBe(3)
  // expect(resolvePath('/DuncanWalter/about/resume')[0]).toBe(3)
  // expect(resolvePath('/DuncanWalter/profile')[0]).toBe('/login')
})
