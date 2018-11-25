import { resolveSlice } from './resolveSlice'
import { OperationSet, OperationSetListMixin } from './operations'

export type ValueMap<Slices extends Slice[]> = {
  [K in keyof Slices]: Slices[K] extends Slice<infer Value> ? Value : never
}

type SliceMixin<Slices extends Slice<any, any>[]> = Slices extends Array<
  Slice<any, infer M>
>
  ? M
  : never

export type SliceConfig<V> = {
  initialValue?: V
  shallow?: boolean
}

const invalidCache = '@slice/invalid-cache'

export type Slice<Value = any, Ops = {}> = __Slice__<any, Value> & Ops

export class __Slice__<Ds extends Slice<any, any>[], V> {
  depth: number
  type: undefined
  children: (null | __Slice__<any, unknown> | ((v: V) => unknown))[]
  childCount: number
  create: (dependencies: ValueMap<Ds>) => V | null
  subscriptions: number[]
  dependencies: Ds
  cachedOutput: V
  volatile?: boolean
  shallow?: boolean
  lazy?: boolean

  constructor(
    dependencies: Ds,
    create: (inputs: ValueMap<Ds>) => V | null,
    initialValue?: V,
    shallow: boolean = true,
  ) {
    this.depth = Math.max(0, ...dependencies.map(dep => dep.depth)) + 1
    this.shallow = shallow
    this.cachedOutput = initialValue || (invalidCache as any)
    this.create = create
    this.children = []
    this.childCount = 0
    this.subscriptions = []
    this.dependencies = dependencies
  }

  tryUpdate(): boolean {
    const oldValue = this.cachedOutput
    const newValue = this.create(this.dependencies.map(
      dep => dep.cachedOutput,
    ) as ValueMap<Ds>)
    switch (true) {
      case newValue === null: {
        return false
      }
      case newValue === undefined: {
        throw new Error(
          'Slice emitted undefined. For noop explicitly return null.',
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

  subscribe(newChild: __Slice__<any, unknown> | ((v: V) => unknown)): number {
    if (!(newChild instanceof __Slice__)) {
      newChild(resolveSlice(this))
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
      throw new Error('Same Slice child unsubscribed twice')
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
  create: (inputs: ValueMap<Ds>) => V,
  initialValue?: V,
  shallow?: boolean,
): Slice<V, SliceMixin<Ds>>

export function createSlice<Ds extends Slice[], V>(
  dependencies: Ds,
  create: (inputs: ValueMap<Ds>) => V | null,
  initialValue: V,
  shallow?: boolean,
): Slice<V, SliceMixin<Ds>>

export function createSlice<Ds extends Slice[], V>(
  dependencies: Ds,
  create: (inputs: ValueMap<Ds>) => V | null,
  initialValue?: V,
  shallow: boolean = true,
  // config: SliceConfig<V> = {},
) {
  return new __Slice__(dependencies, create, initialValue, shallow)
}
