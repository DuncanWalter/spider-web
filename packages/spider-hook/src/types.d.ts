import { Slice, Reducer } from '@dwalter/spider-store'

export interface Selector<T> {
  sources: Source<any>[]
  mapping: (...slices: any) => Slice<T>
}

export type Source<T = any> = Reducer<T, any> | Selector<T>
