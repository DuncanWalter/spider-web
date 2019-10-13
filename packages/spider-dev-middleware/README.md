# @dwalter/spider-dev-middleware

```javascript
import { createDevMiddleware } from '@dwalter/spider-dev-middleware'
import { createStore } from '@dwalter/spider-store'

const devMiddleware = createDevMiddleware()

const store = createStore(devMiddleware)
```

Features:

- Integrates with redux dev tools if present
- Enables time travelling
- persists state in `sessionStorage`
- Deep freezes state automatically
- Checks that object references are normalized
- Checks that slices are uniquely named
