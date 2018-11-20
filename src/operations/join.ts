import { Vertex, VertexConfig, ValueMap, createVertex } from '../vertex'
import { createOperation } from './createOperation'

export const join = createOperation({
  join<U, Vs extends Vertex[], V, O>(
    this: Vertex<U, O>,
    vertices: Vs,
    create: (v: U, ...vs: ValueMap<Vs>) => V,
    config?: VertexConfig<V>,
  ) {
    return createVertex(
      [this, ...vertices],
      inputs => (create as any)(...(inputs as any[])),
      config,
    )
  },
})
