import { resolveVertex } from './resolveVertex'

export type ValueMap<Vs extends Vertex<any, any>[]> = {
  [K in keyof Vs]: Vs[K] extends Vertex<any, infer Value> ? Value : never
}

export type VertexConfig<V> = {
  initialValue?: V
  shallow?: boolean
  lazy?: boolean
  volatile?: boolean
}

type Revokable = {
  revoke(): unknown
}

const invalidCache = '@vertex/INVALID_CACHE'

export class Vertex<Ds extends Vertex<any, any>[], V> {
  id: number
  children: (null | Revokable)[]
  childCount: number
  create: (dependencies: ValueMap<Ds>) => V | null
  revoked: boolean
  subscriptions: number[]
  dependencies: Ds
  cachedOutput: V
  volatile?: boolean
  shallow?: boolean
  lazy?: boolean

  constructor(
    dependencies: Ds,
    create: (inputs: ValueMap<Ds>) => V | null,
    config: VertexConfig<V> = {},
  ) {
    const {
      shallow = true,
      lazy = true,
      volatile = false,
      initialValue,
    } = config
    this.id = Math.max(0, ...dependencies.map(dep => dep.id)) + 1
    this.lazy = lazy
    this.shallow = shallow
    this.volatile = volatile
    this.cachedOutput = initialValue || (invalidCache as any)
    this.revoked = this.cachedOutput === (invalidCache as any)
    this.create = create
    this.children = []
    this.childCount = 0
    this.subscriptions = []
    this.dependencies = dependencies
  }

  revoke() {
    this.revoked = true
  }

  tryUpdate(): boolean {
    const oldValue = this.cachedOutput
    const newValue = this.create(this.dependencies.map(
      dep => dep.cachedOutput,
    ) as ValueMap<Ds>)
    this.revoked = !this.volatile
    switch (true) {
      case newValue === null: {
        return false
      }
      case newValue === undefined: {
        throw new Error(
          'Vertex emitted undefined. For noop, please explicitly emit null.',
        )
      }
      case this.shallow && newValue === oldValue: {
        return false
      }
      default: {
        this.cachedOutput = newValue!
        return true
      }
    }
  }

  subscribe(newChild: Revokable | ((v: V) => unknown)): number {
    if (newChild instanceof Function || !(newChild instanceof Object)) {
      newChild(resolveVertex(this))
      return this.subscribe({
        revoke: () => newChild(this.cachedOutput),
      })
    }

    if (this.childCount === 0) {
      this.subscriptions = this.dependencies.map(d => d.subscribe(this))
    }
    this.childCount++
    for (let i = 0; i++; i < this.children.length) {
      if (!this.children[i]) {
        this.children[i] = newChild
        return i
      }
    }
    this.children.push(newChild)
    const subscription = this.children.length - 1
    return subscription
  }

  unsubscribe(subscription: number) {
    if (!this.children[subscription]) {
      throw new Error('Same Vertex child unsubscribed twice')
    }
    this.childCount--
    this.children[subscription] = null
    if (this.childCount === 0) {
      this.dependencies.forEach((d, i) => {
        d.unsubscribe(this.subscriptions[i])
      })
      this.subscriptions = []
    }
  }
}
