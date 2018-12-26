import { resolveSlice } from './resolveSlice'
import { SliceSet } from './SliceSet'
import { OperationSet, OperationSetListMixin } from '@dwalter/spider-operations'

export type ValueMap<Slices extends Slice[]> = {
  [K in keyof Slices]: Slices[K] extends Slice<infer Value> ? Value : never
}

type SliceMixin<Slices extends Slice<any, any>[]> = Slices extends Array<
  Slice<any, infer M>
>
  ? M
  : never

export type Slice<Value = any, Ops = {}> = __Slice__<any, Value> & Ops

let depth = Number.MIN_SAFE_INTEGER

export class __Slice__<Ds extends Slice[], V> {
  depth: number
  children: SliceSet
  evaluate: (...dependencies: ValueMap<Ds>) => V | null
  dependencies: Ds
  value: V
  shallow?: boolean
  subscriptions: null | number[]

  constructor(
    dependencies: Ds,
    evaluate: (...inputs: ValueMap<Ds>) => V | null,
    initialValue?: V,
    shallow: boolean = true,
  ) {
    this.depth = ++depth
    this.shallow = shallow
    this.value = initialValue || ('@slice/invalid-cache' as any)
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
    let newValue: V | null
    switch (this.dependencies.length) {
      case 0:
        newValue = (this.evaluate as any)()
        break
      case 1:
        newValue = (this.evaluate as any)(this.dep(0))
        break
      case 2:
        newValue = (this.evaluate as any)(this.dep(0), this.dep(1))
        break
      case 3:
        newValue = (this.evaluate as any)(this.dep(0), this.dep(1), this.dep(2))
        break
      default:
        newValue = this.evaluate(
          ...(this.dependencies.map(dep => dep.value) as any),
        )
    }
    if (newValue === null) {
      return false
    }
    if (newValue === undefined) {
      return false
    }
    if (this.shallow && newValue === oldValue) {
      return false
    }
    this.value = newValue!
    return true
  }

  subscribe(newChild: Slice | ((v: V) => unknown)): number {
    if (this.children.size === 0) {
      this.subscriptions = this.dependencies.map(d => d.subscribe(this))
    }
    const content = resolveSlice(this)
    if (newChild instanceof __Slice__) {
      return this.children.add(newChild)
    } else {
      newChild(content)
      return this.children.add(createSlice([this], newChild as any))
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

  use<M, Os extends OperationSet[]>(
    this: Slice<V, M>,
    ...operations: Os
  ): Slice<V, M & OperationSetListMixin<Os>> {
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
  shallow?: boolean,
): Slice<V, SliceMixin<Ds>>

export function createSlice<Ds extends Slice[], V>(
  dependencies: Ds,
  evaluate: (...inputs: ValueMap<Ds>) => V | null,
  initialValue: V,
  shallow?: boolean,
): Slice<V, SliceMixin<Ds>>

export function createSlice<Ds extends Slice[], V>(
  dependencies: Ds,
  evaluate: (...inputs: ValueMap<Ds>) => V | null,
  initialValue?: V,
  shallow: boolean = true,
) {
  return new __Slice__(dependencies, evaluate, initialValue, shallow)
}
