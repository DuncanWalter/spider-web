import { SwapSet, Subscription } from './SwapSet'
import { Network } from './types'

export type ValueMap<Slices extends __Slice__[]> = {
  [K in keyof Slices]: Slices[K] extends __Slice__<infer Value> ? Value : never
}

type __Slice__<Value = any> = Slice<Value, any>

export { __Slice__ as Slice }

class Slice<V, Ds extends __Slice__[] = any> {
  network: Network
  depth: number
  children: SwapSet<Slice<unknown>>
  evaluate: (...dependencies: ValueMap<Ds>) => V
  dependencies: Ds
  value: V
  subscriptions: null | Subscription<V>[]

  static createSlice<Ds extends __Slice__[], V>(
    network: Network,
    dependencies: Ds,
    evaluate: (...inputs: ValueMap<Ds>) => V,
    initialValue?: V,
  ): __Slice__<V> {
    return new Slice(network, dependencies, evaluate, initialValue)
  }

  constructor(
    network: Network,
    dependencies: Ds,
    evaluate: (...inputs: ValueMap<Ds>) => V,
    initialValue?: V,
  ) {
    let depth = 0
    for (let i = 0; i < dependencies.length; i++) {
      if (dependencies[i].depth > depth) {
        depth = dependencies[i].depth
      }
    }
    this.network = network
    this.depth = depth + 1
    this.value = initialValue as V
    this.evaluate = evaluate
    this.children = new SwapSet()
    this.dependencies = dependencies
    this.subscriptions = null
  }

  dep<N extends number>(n: N): ValueMap<Ds>[N] {
    return this.dependencies[n].value
  }

  hasUpdate(): boolean {
    const oldValue = this.value
    const newValue = this.resolveShallow()
    if (oldValue !== newValue) {
      this.value = newValue
      return true
    }
    return false
  }

  resolveShallow(): V {
    switch (this.dependencies.length) {
      case 0:
        return (this.evaluate as any)()
      case 1:
        return (this.evaluate as any)(this.dep(0))
      case 2:
        return (this.evaluate as any)(this.dep(0), this.dep(1))
      case 3:
        return (this.evaluate as any)(this.dep(0), this.dep(1), this.dep(2))
      default:
        return this.evaluate(
          ...(this.dependencies.map(dep => dep.value) as any),
        )
    }
  }

  push() {
    this.network.enqueue(this)
  }

  subscribe(newChild: __Slice__ | ((v: V) => unknown)) {
    if (this.children.isEmpty()) {
      this.subscriptions = this.dependencies.map(d => d.subscribe(this))
      this.hasUpdate()
    }
    if (newChild instanceof Slice) {
      return this.children.add(newChild)
    } else {
      const slice = this.map(newChild)
      slice.depth = Infinity
      const subscription = this.children.add(slice)
      newChild(this.value)
      return subscription
    }
  }

  unsubscribe(subscription: Subscription<V>) {
    this.children.remove(subscription)
    if (this.children.isEmpty()) {
      this.dependencies.forEach((d, i) => {
        d.unsubscribe(this.subscriptions![i])
      })
      this.subscriptions = null
    }
  }

  map<T>(mapping: (v: V) => T): Slice<T, [Slice<V>]> {
    return Slice.createSlice(this.network, [this], mapping as any)
  }
}

export const createSlice = Slice.createSlice

export function isSlice<T>(query: unknown): query is __Slice__<T> {
  return query && query instanceof Slice
}
