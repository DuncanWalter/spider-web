// type Tail<Ts extends any[]> = ((...as: Ts) => any) extends ((
//   a: any,
//   ...rest: infer U
// ) => any)
//   ? U
//   : never

// type Head<Ts extends any[]> = ((...as: Ts) => any) extends ((
//   a: infer U,
//   ...rest: any[]
// ) => any)
//   ? U
//   : never

// type Cons<H, Ts> = Ts extends any[]
//   ? ((first: H, ...rest: Ts) => any) extends ((...args: infer As) => any)
//     ? As
//     : never
//   : never

// type Unpack<T> = T extends (() => infer U) ? U : never

// type Instance<T> = T extends Iterable<infer U> ? U : never

// type ZipPack<Ts extends any[]> = {
//   basis: () => []
//   value: () => Cons<Instance<Head<Ts>>, Unpack<ZipPack<Tail<Ts>>>>
// }[Ts extends [] ? 'basis' : 'value']

// type Zip<Iters extends Iterable<any>[]> = Unpack<ZipPack<Iters>>[]

// type ComposePair<A, B> = A extends ((a: infer X) => infer Y)
//   ? B extends (a: Y) => infer Z ? ((a: X) => Z) : 'TYPE_MISMATCH'
//   : 'NON_FUNCTION'

// type ComposePack<Ts extends any[]> = {
//   basis: () => Head<Ts>
//   value: () => ComposePair<Head<Ts>, Unpack<ComposePack<Tail<Ts>>>>
// }[Ts extends [any] ? 'basis' : 'value']
//
// type Compose<Iters extends any[]> = Unpack<ComposePack<Iters>>

// const b: Head<[number, string, object]> = 3
// const c: Tail<[number, string, object]> = ['2', {}]
// const r: Tail<[number]> = []
// const d: Cons<number, [string, object]> = [3, '2', {}]
// const e: Zip<[]> = []
// const f: Zip<[number[], string[]]> = [[3, ''], [4, 'aaaa']]
// const g: ComposePair<((a: number) => string), ((a: string) => object)> = (
//   a: number,
// ) => ({})
// const h: Compose<[((a: number) => string)]> = (a: number) => 'a'
// const i: Compose<[((a: number) => string), ((a: string) => object)]> = (
//   a: number,
// ) => ({})
// const j: Compose<
//   [
//     ((a: number) => string),
//     ((a: string) => object),
//     (a: object) => 'I made it!'
//   ]
// > = (a: number) => 'I made it!'
