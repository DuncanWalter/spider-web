import { mapObjectProps, Just } from '../utils'
import { Vertex } from './vertex'

type VertexMap = {
  [props: string]: Vertex
}

type ValueMap<VM extends VertexMap> = {
  [K in keyof VM]: VM[K] extends Vertex<any, any, infer T> ? T : never
}

export type PolyVertexBehavior<
  I extends { [prop: string]: Just },
  V extends Just
> =
  | ((arg: I) => V)
  | {
      initialValue: V
      create(arg: I): V | null
      shallow?: boolean
      lazy?: boolean
      volatile?: boolean
    }
  | {
      initialValue?: V
      create(arg: I): V
      shallow?: boolean
      lazy?: boolean
      volatile?: boolean
    }

export class PolyVertex<D extends VertexMap, V> extends Vertex<
  D,
  ValueMap<D>,
  V
> {
  dependencies: D
  subscriptions?: { [K in keyof D]: number }

  constructor(dependencies: D, behavior: PolyVertexBehavior<ValueMap<D>, V>) {
    super(behavior, {})
    this.dependencies = dependencies
    this.cachedInput = {} as any
  }

  propagateSubscription() {
    const that = this
    this.subscriptions = mapObjectProps(
      this.dependencies,
      (dep, key) => {
        return dep.subscribe({
          push(value) {
            ;(that.cachedInput as any)[key] = value
            that.push(that.cachedInput)
          },
        })
      },
      {},
    )
  }

  propagateUnsubscription() {
    if (this.subscriptions) {
      mapObjectProps(this.subscriptions, (sub, key) => {
        this.dependencies[key].unsubscribe(sub)
      })
      this.subscriptions = undefined
    }
  }

  assertCachedDependencyValues(): boolean {
    let cacheIsValid = true
    for (const key of Object.keys(this.dependencies)) {
      const dep = this.dependencies[key as keyof D]
      const newValue = dep.pull()
      if (this.cachedInput[key] !== newValue || !dep.shallow) {
        this.cachedInput[key] = newValue
        cacheIsValid = false
      }
    }
    return cacheIsValid
  }
}
