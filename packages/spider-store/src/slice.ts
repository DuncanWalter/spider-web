import { SliceSet, Subscription } from './sliceSet'
import { isFunction } from './isFunction'
import { OperationSet, OperationSetListMixin, Shallow } from './types'

type ValueMap<Slices extends __Slice__[]> = {
  [K in keyof Slices]: Slices[K] extends __Slice__<infer Value> ? Value : never
}

/**
 * A `Slice` is similar to an observable with a few key differences.
 * `Slice`s cannot complete, are guaranteed to have exactly one
 * valid state at all times, and have built in support for
 * de-duplicating equivalent states if desired. A `Slice` should
 * be thought of as a wrapper around some piece of state which
 * can be accessed by subscribing to the `Slice`. `Slices` also
 * support an operator API similar to that of `rxjs` (but not the same).
 */
type __Slice__<Value = any, Ops = {}> = Slice<Value, any> & Ops

export { __Slice__ as Slice }

function didUpdate<V>(shallow: Shallow<V>, a: V, b: V) {
  if (isFunction(shallow)) return !shallow(a, b)
  if (shallow) return a !== b
  return true
}

class Slice<V, Ds extends __Slice__[] = any> {
  depth: number
  children: SliceSet
  evaluate: (...dependencies: ValueMap<Ds>) => V
  dependencies: Ds
  value: V
  shallow: Shallow<V>
  subscriptions: null | Subscription[]

  constructor(
    dependencies: Ds,
    evaluate: (...inputs: ValueMap<Ds>) => V,
    initialValue?: V,
    shallow: Shallow<V> = true,
  ) {
    let depth = 0
    for (let i = 0; i < dependencies.length; i++) {
      if (dependencies[i].depth > depth) {
        depth = dependencies[i].depth
      }
    }
    this.depth = depth + 1
    this.shallow = shallow
    this.value = initialValue as V
    this.evaluate = evaluate
    this.children = new SliceSet()
    this.dependencies = dependencies
    this.subscriptions = null
  }

  dep<N extends number>(n: N): ValueMap<Ds>[N] {
    return this.dependencies[n].value
  }

  tryUpdate(): boolean {
    const oldValue = this.value
    const newValue = this.resolveShallow()
    if (didUpdate(this.shallow, oldValue, newValue)) {
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

  subscribe(newChild: __Slice__ | ((v: V) => unknown)) {
    if (this.children.isEmpty()) {
      this.subscriptions = this.dependencies.map(d => d.subscribe(this))
      this.tryUpdate()
    }
    if (newChild instanceof Slice) {
      return this.children.add(newChild)
    } else {
      const slice = createSlice([this], newChild as any)
      slice.depth = Infinity
      const subscription = this.children.add(slice)
      newChild(this.value)
      return subscription
    }
  }

  unsubscribe(subscription: Subscription) {
    this.children.remove(subscription)
    if (this.children.isEmpty()) {
      this.dependencies.forEach((d, i) => {
        d.unsubscribe(this.subscriptions![i])
      })
      this.subscriptions = null
    }
  }

  use<Os extends OperationSet[]>(
    this: Slice<V>,
    ...operations: Os
  ): Slice<V> & OperationSetListMixin<Os> {
    for (let set of operations) {
      if (set.applied) {
        continue
      } else if (set.type === '@slice/operation-cluster') {
        for (let operation of set.operations) {
          this.use(operation)
        }
      } else {
        Object.assign(Slice.prototype, set.operation)
      }
    }
    return this as any
  }
}

export function createSlice<Ds extends __Slice__[], V>(
  dependencies: Ds,
  evaluate: (...inputs: ValueMap<Ds>) => V,
  initialValue?: V,
  shallow: Shallow<V> = true,
): __Slice__<V> {
  return new Slice(dependencies, evaluate, initialValue, shallow)
}

export function isSlice<T>(query: unknown): query is __Slice__<T> {
  return query && query instanceof Slice
}
