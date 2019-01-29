import { SliceSet } from './SliceSet'
import { OperationSet, OperationSetListMixin } from '@dwalter/spider-operations'

export type ValueMap<Slices extends Slice[]> = {
  [K in keyof Slices]: Slices[K] extends Slice<infer Value> ? Value : never
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
export type Slice<Value = any, Ops = {}> = __Slice__<Value, any> & Ops

/**
 * `Shallow` is a type which represents the policy followed by
 * a `Slice` when determining whether an update should be pushed
 * to subscribers. If `true`, the `Slice` will perform a shallow
 * equality check and only push changes if the old and new values
 * of the `Slice` are not equal. If `false`, the `Slice` will push
 * all updates regardless of whether the value appears to have
 * changed. For cases where `false` is not fine grained enough,
 * a function comparing the old and new values can be passed. If the
 * comparing function returns true, the values are considered equal and
 * the update is not pushed to subscribers.
 */
export type Shallow<V = unknown> = boolean | ((a: V, b: V) => boolean)

export function didUpdate<V>(shallow: Shallow<V>, a: V, b: V) {
  if (typeof shallow === 'function') {
    return !shallow(a, b)
  } else if (shallow) {
    return a !== b
  }
  return true
}

export class __Slice__<V, Ds extends Slice[] = any> {
  depth: number
  children: SliceSet
  evaluate: (...dependencies: ValueMap<Ds>) => V
  dependencies: Ds
  value: V
  shallow: Shallow<V>
  subscriptions: null | number[]

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
    this.value = initialValue || (null as any)
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
      this.value = newValue!
      return true
    }
    return false
  }

  resolveShallow() {
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

  subscribe(newChild: Slice | ((v: V) => unknown)): number {
    if (this.children.size === 0) {
      this.subscriptions = this.dependencies.map(d => d.subscribe(this))
      this.tryUpdate()
    }
    if (newChild instanceof __Slice__) {
      return this.children.add(newChild)
    } else {
      const slice = createSlice([this], newChild as any)
      slice.depth = Infinity
      const subscription = this.children.add(slice)
      newChild(this.value)
      return subscription
    }
  }

  unsubscribe(subscription: number) {
    this.children.remove(subscription)
    if (this.children.size === 0) {
      this.dependencies.forEach((d, i) => {
        d.unsubscribe(this.subscriptions![i])
      })
      this.subscriptions = null
    }
  }

  use<Os extends OperationSet[]>(
    this: __Slice__<V>,
    ...operations: Os
  ): __Slice__<V> & OperationSetListMixin<Os> {
    for (let set of operations) {
      if (set.applied) {
        continue
      } else if (set.type === '@slice/operation-cluster') {
        for (let operation of set.operations) {
          this.use(operation)
        }
      } else {
        Object.assign(__Slice__.prototype, set.operation)
      }
    }
    return this as any
  }
}

export function createSlice<Ds extends Slice[], V>(
  dependencies: Ds,
  evaluate: (...inputs: ValueMap<Ds>) => V,
  initialValue?: V,
  shallow: Shallow<V> = true,
): Slice<V> {
  return new __Slice__(dependencies, evaluate, initialValue, shallow)
}
