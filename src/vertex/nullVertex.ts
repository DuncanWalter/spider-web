// import { VertexConfig, Vertex } from './vertex'
// import { Just } from '../utils'

// export class NullVertex<V extends Just> extends Vertex<null, null, V> {
//   static create<V extends Just>(
//     create: () => V,
//     config?: VertexConfig<V>,
//   ): NullVertex<V>
//   static create<V extends Just>(
//     create: () => V | null,
//     config?: VertexConfig<V> & { initialValue: V },
//   ): NullVertex<V>
//   static create<V extends Just>(
//     create: () => V | null,
//     config?: VertexConfig<V>,
//   ) {
//     return new NullVertex(create, config)
//   }

//   private constructor(create: () => V | null, config?: VertexConfig<V>) {
//     super(create, null, config)
//   }

//   propagateSubscription() {}
//   propagateUnsubscription() {}
//   assertCachedDependencyValues() {
//     return true
//   }
// }
