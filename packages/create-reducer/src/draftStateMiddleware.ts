import { Middleware } from './types'
import {
  DraftSpec,
  createProducer,
  arraySpec,
  objectSpec,
} from './createProducer'

interface DraftStateMiddlewareConfig {
  draftSpecs: DraftSpec[]
}

export function createDraftStateMiddleware({
  draftSpecs = [arraySpec, objectSpec],
}: Partial<DraftStateMiddlewareConfig> = {}): Middleware {
  const draftStateMiddleware: Middleware = function(store, { wrapReducer }) {
    const produce = createProducer(draftSpecs)

    return {
      wrapReducer(reducer) {
        const slice = wrapReducer(reducer)
        const nextState = slice.nextState

        slice.nextState = (oldState, actions) =>
          produce(draftState => nextState(draftState, actions), oldState)

        return slice
      },
    }
  }

  return draftStateMiddleware
}
