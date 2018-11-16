import { PrioritySet } from '../utils'

export type ValueMap<Vs extends Vertex<any, any>[]> = {
  [K in keyof Vs]: Vs[K] extends Vertex<any, infer Value> ? Value : never
}

export type VertexConfig<V> = {
  initialValue?: V
  shallow?: boolean
  lazy?: boolean
  volatile?: boolean
}

const invalidCache = Symbol('INVALID_CACHE')

interface Revokable {
  revoke(): void
}

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

  static propagate(marks: PrioritySet<Vertex<any, unknown>>) {
    while (marks.size !== 0) {
      const node = marks.pop()
      if (node.revoked) {
        const updated = node.tryUpdate()
        if (updated) {
          for (let child of node.children) {
            if (child) {
              child.revoke()
              marks.add(child)
            }
          }
        }
      }
    }
  }

  // TODO: static resolve (pull from bottom)

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
    this.revoked = initialValue === undefined
    this.cachedOutput = this.revoked ? (invalidCache as any) : initialValue
    this.create = create
    this.children = []
    this.childCount = 0
    this.subscriptions = []
    this.dependencies = dependencies
  }

  revoke() {
    // const lastValue = this.cachedOutput
    this.revoked = true
    // if (!this.lazy) {
    //   this.tryUpdate()
    // }
    // if (this.childCount > 0 || !this.lazy) {
    //   const newValue = this.create(this.cachedInput)
    //   if (newValue !== null) {
    //     this.cachedOutput = newValue
    //     this.revoked = false
    //     if (newValue !== lastValue || !this.shallow) {
    //       for (const child of this.children) {
    //         if (child !== null) {
    //           child.ping(new Set())
    //         }
    //       }
    //     }
    //   } else {
    //     this.revoked = false
    //   }
    // }
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
      case this.shallow && newValue === oldValue: {
        return false
      }
      default: {
        this.cachedOutput = newValue!
        return true
      }
    }
  }

  subscribe(newChild: Revokable): number {
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
