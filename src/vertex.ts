import { resolveVertex } from './resolveVertex'
import { OperationSet, OperationSetListMixin } from './operations'

export type ValueMap<Vs extends Vertex[]> = {
  [K in keyof Vs]: Vs[K] extends Vertex<infer Value> ? Value : never
}

type VertexMixin<Vs extends Vertex<any, any>[]> = Vs extends Array<
  Vertex<any, infer M>
>
  ? M
  : never

export type VertexConfig<V> = {
  initialValue?: V
  shallow?: boolean
  lazy?: boolean
  volatile?: boolean
}

type Revokable =
  | Vertex
  | {
      type: '@vertex/subscription'
      revoke(): unknown
    }

const invalidCache = '@vertex/invalid-cache'

export type Vertex<Value = any, Ops = {}> = __Vertex__<any, Value> & Ops

export class __Vertex__<Ds extends Vertex<any, any>[], V> {
  id: number
  type: undefined
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
        type: '@vertex/subscription',
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

  use<M, Os extends OperationSet[]>(
    this: Vertex<V, M>,
    ...operations: Os
  ): Vertex<V, M & OperationSetListMixin<Os>> {
    for (let set of operations) {
      if (set.applied) {
        continue
      } else if (set.type === '@vertex/operation-cluster') {
        for (let operation of set.operations) {
          this.use(operation)
        }
      } else {
        Object.assign(__Vertex__.prototype, set.operation)
      }
    }
    return this as any
  }
}

export function createVertex<Ds extends Vertex[], V>(
  dependencies: Ds,
  create: (inputs: ValueMap<Ds>) => V,
  config?: VertexConfig<V>,
): Vertex<V, VertexMixin<Ds>>

export function createVertex<Ds extends Vertex[], V>(
  dependencies: Ds,
  create: (inputs: ValueMap<Ds>) => V | null,
  config: { initialValue: V } & VertexConfig<V>,
): Vertex<V, VertexMixin<Ds>>

export function createVertex<Ds extends Vertex[], V>(
  dependencies: Ds,
  create: (inputs: ValueMap<Ds>) => V | null,
  config: VertexConfig<V> = {},
) {
  return new __Vertex__(dependencies, create, config)
}
