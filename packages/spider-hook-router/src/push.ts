import { createBrowserHistory } from 'history'
import { isPromise } from './utils'
import { selectRoute, ResolutionContext } from '.'

function createPush<T>(
  isTerminal: (arg: unknown) => arg is T,
  history = createBrowserHistory(),
) {
  return function push(path: string, ctx: ResolutionContext<T>) {
    if (path === ctx.path) {
      return
    }

    const result = selectRoute({
      ...ctx,
      isTerminal,
      path,
    })

    if (isPromise(result)) {
      result.then(res => {
        const [route, ctx] = result
      })
    } else {
      const [route, ctx] = result
      history.push(path)
    }
  }
}
