import { mapObjectProps, Just } from '../utils'
import { Vertex, VertexConfig } from './vertex'

type VertexMap = {
  [props: string]: Vertex
}

type ValueMap<VM extends VertexMap> = {
  [K in keyof VM]: VM[K] extends Vertex<any, any, infer T> ? T : never
}

export class PolyVertex<D extends VertexMap, V> extends Vertex<
  D,
  ValueMap<D>,
  V
> {
  static create<D extends VertexMap, V extends Just>(
    dependency: D,
    create: (a: ValueMap<D>) => V,
    config?: VertexConfig<V>,
  ): PolyVertex<D, V>
  static create<D extends VertexMap, V extends Just>(
    dependency: D,
    create: (a: ValueMap<D>) => V | null,
    config?: VertexConfig<V> & { initialValue: V },
  ): PolyVertex<D, V>
  static create<D extends VertexMap, V extends Just>(
    dependency: D,
    create: (a: ValueMap<D>) => V | null,
    config?: VertexConfig<V>,
  ) {
    return new PolyVertex(dependency, create, config)
  }

  dependencies: D
  subscriptions?: { [K in keyof D]: number }

  private constructor(
    dependencies: D,
    create: (a: ValueMap<D>) => V | null,
    config?: VertexConfig<V>,
  ) {
    // TODO: unsafe?
    super(create, {} as any, config)
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
