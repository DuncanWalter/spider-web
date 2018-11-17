import { Vertex, VertexConfig, ValueMap } from '../vertex/vertex'
import './thru'

declare module '../vertex/vertex' {
  interface Vertex<Ds, V> {
    with<Vs extends Vertex<any, any>[], U>(
      this: Vertex<Ds, V>,
      vertices: Vs,
      create: (v: V, ...vs: ValueMap<Vs>) => U,
      config?: VertexConfig<U>,
    ): Vertex<any, U>
  }
}

Vertex.prototype.with = function<
  Ds extends Vertex<any, any>[],
  V,
  Vs extends Vertex<any, any>[],
  U
>(
  this: Vertex<Ds, V>,
  vertices: Vs,
  create: (v: V, ...vs: ValueMap<Vs>) => U,
  config?: VertexConfig<U>,
) {
  return new Vertex(
    [this, ...vertices],
    inputs => (create as any)(...(inputs as any[])),
    config,
  )
}
