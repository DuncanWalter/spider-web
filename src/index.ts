import { mapObjectProps, Just } from './utils'
import { Vertex, NullVertex, MonoVertex, PolyVertex } from './vertex'
import { NullVertexBehavior } from './vertex/nullVertex'
import { MonoVertexBehavior } from './vertex/monoVertex'
import { PolyVertexBehavior } from './vertex/polyVertex'

type ResourceMap = {
  [prop: string]: Resource
}

type ResourceValue<R extends Resource> = R extends Resource<infer V> ? V : never

type Resources = Resource | ResourceMap

type ResourceValues<R extends Resources> = R extends Resource<infer V>
  ? V
  : R extends ResourceMap ? { [K in keyof R]: ResourceValue<R[K]> } : never

type Action<V extends Just = any, R = any> = (
  state: V,
  resolve: (value: V) => void,
) => R

type ActionMap<V extends Just = any> = {
  [prop: string]: Action<V>
}

export class Resource<V extends Just = any, A extends ActionMap = any> {
  static define<R extends Resources, V extends Just>(
    create: NullVertexBehavior<V>,
  ): Resource<V>
  static define<R extends Resources, V extends Just>(
    dependencies: R,
    create:
      | MonoVertexBehavior<ResourceValues<R>, V>
      | PolyVertexBehavior<ResourceValues<R>, V>,
  ): Resource<V>
  static define<R extends Resources, V extends Just>(
    dependencies: NullVertexBehavior<V> | R,
    create?:
      | MonoVertexBehavior<ResourceValues<R>, V>
      | PolyVertexBehavior<ResourceValues<R>, V>,
  ) {
    if (create === undefined) {
      if (dependencies === null) {
        throw new Error('invalid resource definition')
      }
      if (dependencies instanceof Resource) {
        throw new Error('invalid resource definition')
      }
      if (dependencies instanceof Function) {
        return new Resource(new NullVertex(dependencies))
      }
      if ('create' in dependencies && dependencies.create instanceof Function) {
        return new Resource(new NullVertex<V>(dependencies))
      }
      throw new Error('invalid resource definition')
    } else {
      if (dependencies instanceof Function) {
        throw new Error('invalid resource definition')
      }
      if ('create' in dependencies) {
        throw new Error('invalid resource definition')
      }
      if (dependencies instanceof Resource) {
        // TODO: TS may be provably not a superset of JS, but it is definitely
        // a superset of BS; so at least they've got that going for them
        return new Resource(
          new MonoVertex<any, V>(
            (dependencies as Resource).toVertex(),
            create as any,
          ),
        )
      }
      if (dependencies instanceof Object) {
        // TODO: TS may be provably not a superset of JS, but it is definitely
        // a superset of BS; so at least they've got that going for them
        return new Resource(
          new PolyVertex<any, V>(
            mapObjectProps(dependencies as { [prop: string]: Resource }, res =>
              res.toVertex(),
            ),
            create as any,
          ),
        )
      }
    }
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

  revoke() {
    this.vertex.revoke()
  }

  private vertex: Vertex<any, any, V>
  private toVertex(): Vertex<any, any, V> {
    return this.vertex
  }

  constructor(vertex: Vertex<any, any, V>) {
    this.vertex = vertex
  }
}

export const defineResource = Resource.define
export const requestResource = Resource.request
