// import { Vertex, VertexConfig } from './vertex'
// import { Just } from '../utils'

// type VertexValue<V> = V extends Vertex<any, any, infer T> ? T : never

// export class MonoVertex<D extends Vertex, V> extends Vertex<
//   D,
//   VertexValue<D>,
//   V
// > {
//   static create<D extends Vertex, V extends Just>(
//     dependency: D,
//     create: (a: VertexValue<D>) => V,
//     config?: VertexConfig<V>,
//   ): MonoVertex<D, V>
//   static create<D extends Vertex, V extends Just>(
//     dependency: D,
//     create: (a: VertexValue<D>) => V | null,
//     config?: VertexConfig<V> & { initialValue: V },
//   ): MonoVertex<D, V>
//   static create<D extends Vertex, V extends Just>(
//     dependency: D,
//     create: (a: VertexValue<D>) => V | null,
//     config?: VertexConfig<V>,
//   ) {
//     return new MonoVertex(dependency, create, config)
//   }

//   dependency: D
//   subscription?: number

//   private constructor(
//     dependency: D,
//     create: ((arg: VertexValue<D>) => V | null),
//     config?: VertexConfig<V>,
//   ) {
//     // TODO: should be invalid cache symbol
//     super(create, null as any, config)
//     this.dependency = dependency
//     if (this.lazy === undefined) {
//       this.lazy = dependency.lazy
//     }
//     if (this.shallow === undefined) {
//       this.shallow = dependency.shallow
//     }
//     if (this.volatile === undefined) {
//       this.volatile = dependency.volatile
//     }
//   }
//   propagateSubscription() {
//     this.subscription = this.dependency.subscribe(this)
//   }
//   propagateUnsubscription() {
//     if (this.subscription !== undefined) {
//       this.dependency.unsubscribe(this.subscription)
//       this.subscription = undefined
//     }
//   }
//   assertCachedDependencyValues() {
//     const lastValue = this.cachedInput
//     this.cachedInput = this.dependency.pull()
//     return lastValue === this.cachedInput && !!this.dependency.shallow
//   }
// }
