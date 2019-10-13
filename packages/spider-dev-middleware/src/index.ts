import { createPersistMiddleware } from './persistMiddleware'

function isNameCrushed() {
  return isNameCrushed.name !== 'isNameCrushed'
}

if (isNameCrushed()) {
  console.error(new Error('using spider-dev-middleware in minified code.'))
}

export { createPersistMiddleware }
