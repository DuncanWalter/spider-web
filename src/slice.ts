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

export type Slice<Value = any, Ops = {}> = __Slice__<any, Value> & Ops

export class __Slice__<Ds extends Slice[], V> {
  depth: number
  type: undefined
  children: Set<Slice | ((v: V) => unknown)>
  create: (...dependencies: ValueMap<Ds>) => V | null
  dependencies: Ds
  cachedOutput: V
  shallow?: boolean

  constructor(
    dependencies: Ds,
    create: (...inputs: ValueMap<Ds>) => V | null,
    initialValue?: V,
    shallow: boolean = true,
  ) {
    this.depth = 0
    for (let i = 0; i < dependencies.length; i++) {
      if (this.depth < dependencies[i].depth) {
        this.depth = dependencies[i].depth
      }
    }
    this.depth++
    this.shallow = shallow
    this.cachedOutput = initialValue || ('@slice/invalid-cache' as any)
    this.create = create
    this.children = new Set()
    this.dependencies = dependencies
  }

  dep<N extends number>(n: N): ValueMap<Ds>[N] {
    return this.dependencies[n].cachedOutput
  }

  tryUpdate(): boolean {
    const oldValue = this.cachedOutput
    let newValue: V | null
    switch (this.dependencies.length) {
      case 0: {
        newValue = (this.create as any)()
        break
      }
      case 1: {
        newValue = (this.create as any)(this.dep(0))
        break
      }
      case 2: {
        newValue = (this.create as any)(this.dep(0), this.dep(1))
        break
      }
      case 3: {
        newValue = (this.create as any)(this.dep(0), this.dep(1), this.dep(2))
        break
      }
      default: {
        newValue = this.create(
          ...(this.dependencies.map(dep => dep.cachedOutput) as any),
        )
      }
    }
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

  subscribe(newChild: Slice | ((v: V) => unknown)) {
    if (this.children.size === 0) {
      this.dependencies.forEach(d => d.subscribe(this))
    }
    const content = resolveSlice(this)
    this.children.add(newChild)
    if (!(newChild instanceof __Slice__)) {
      newChild(content)
    }
  }

  unsubscribe(child: Slice | ((v: V) => unknown)) {
    this.children.delete(child)
    if (this.children.size === 0) {
      this.dependencies.forEach((d, i) => {
        d.unsubscribe(this)
      })
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
  create: (...inputs: ValueMap<Ds>) => V,
  initialValue?: V,
  shallow?: boolean,
): Slice<V, SliceMixin<Ds>>

export function createSlice<Ds extends Slice[], V>(
  dependencies: Ds,
  create: (...inputs: ValueMap<Ds>) => V | null,
  initialValue: V,
  shallow?: boolean,
): Slice<V, SliceMixin<Ds>>

export function createSlice<Ds extends Slice[], V>(
  dependencies: Ds,
  create: (...inputs: ValueMap<Ds>) => V | null,
  initialValue?: V,
  shallow: boolean = true,
) {
  return new __Slice__(dependencies, create, initialValue, shallow)
}
