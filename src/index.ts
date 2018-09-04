import { mapObjectProps, Just } from './utils'
import { Vertex, NullVertex, MonoVertex, PolyVertex } from './vertex'
import { VertexConfig } from './vertex/vertex'

type ResourceMap = {
  [prop: string]: Resource
}

type ResourceValue<R extends Resource> = R extends Resource<infer V> ? V : never

type Resources = Resource | ResourceMap

type ResourceValues<R extends Resources> = R extends Resource<infer V>
  ? V
  : R extends ResourceMap ? { [K in keyof R]: ResourceValue<R[K]> } : never

type Action<V extends Just = any, P = any, R = any> = (
  publish: (value: V) => void,
  state: V,
  payload: P,
) => R

type ActionMap<V extends Just = any> = {
  [prop: string]: Action<V>
}

export class Resource<V extends Just = any, A extends ActionMap = any> {
  static define<R extends Resources, V extends Just>(
    create: () => V,
    config?: VertexConfig<V> & { actions?: ActionMap<V> },
  ): Resource<V>
  static define<R extends Resources, V extends Just>(
    create: () => V | null,
    config: VertexConfig<V> & { actions?: ActionMap<V> } & { initialValue: V },
  ): Resource<V>
  static define<R extends Resources, V extends Just>(
    dependencies: R,
    create: (a: ResourceValues<R>) => V,
    config?: VertexConfig<V> & { actions?: ActionMap<V> },
  ): Resource<V>
  static define<R extends Resources, V extends Just>(
    dependencies: R,
    create: (a: ResourceValues<R>) => V,
    config: VertexConfig<V> & { actions?: ActionMap<V> } & { initialValue: V },
  ): Resource<V>
  static define<R extends Resources, V extends Just>(
    dependencies: (() => V) | R,
    create?:
      | (VertexConfig<V> & { actions?: ActionMap<V> })
      | ((a: ResourceValues<R>) => V),
    config?: VertexConfig<V> & { actions?: ActionMap<V> },
  ) {
    if (dependencies instanceof Function) {
      if (create) {
        if (!(create instanceof Function)) {
          return new Resource(
            NullVertex.create(dependencies, create),
            create.actions,
          )
        }
      } else {
        return new Resource(NullVertex.create(dependencies))
      }
    } else {
      if (create instanceof Function) {
        if (dependencies instanceof Resource) {
          return new Resource(
            MonoVertex.create(
              (dependencies as Resource).toVertex(),
              create,
              config,
            ),
            config ? config.actions : undefined,
          )
        } else {
          return new Resource(
            PolyVertex.create(
              mapObjectProps(
                dependencies as { [prop: string]: Resource },
                res => res.toVertex(),
              ),
              // TODO: need to use the same helper type here and in polyVertex
              create as any,
              config,
            ),
            config ? config.actions : undefined,
          )
        }
      }
    }
    throw new Error('invalid resource definition')
  }

  static request<R extends Resource | { [prop: string]: Resource }>(
    resources: R,
  ) {
    if (resources instanceof Resource) {
      return (resources as Resource).toVertex().pull()
    } else {
      return mapObjectProps(resources as { [prop: string]: Resource }, prop =>
        prop.toVertex().pull(),
      )
    }
  }
  private vertex: Vertex<any, any, V>

  // TODO: add the actions to the thing
  constructor(vertex: Vertex<any, any, V>, actions?: ActionMap<V>) {
    this.vertex = vertex
  }

  revoke() {
    this.vertex.revoke()
  }

  private toVertex(): Vertex<any, any, V> {
    return this.vertex
  }
}

export const defineResource = Resource.define
export const requestResource = Resource.request
