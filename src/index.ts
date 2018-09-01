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

export class Resource<V extends Just = any, A extends {} = any> {
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
        return new NullVertex(dependencies)
      }
      if ('create' in dependencies && dependencies.create instanceof Function) {
        return new NullVertex(dependencies)
      }
      throw new Error('invalid resource definition')
    } else {
      if(dependencies instanceof Function){
        throw new Error('invalid resource definition')
      }
      if('create' in dependencies && dependencies.create instanceof Function){
        throw new Error('invalid resource definition')
      }
      if(dependencies instanceof Resource){
        dependencies.toVertex()
        return new MonoVertex(, create)
      }
      
    }

    if (dependencies === null) {
      return new Resource(new NullVertex<V>(create))
    } else if (dependencies instanceof Resource) {
      return new Resource(
        new MonoVertex<any, V>(dependencies.toVertex(), create),
      )
    } else {
      return new Resource(
        new PolyVertex(
          mapObjectProps(dependencies, res => res.toVertex()),
          create,
        ),
      )
    }
  }

  static request<R extends Resources>(resources: R) {
    if (resources instanceof Resource) {
      return resources.toVertex().pull()
    } else {
      return mapObjectProps(resources, prop => prop.toVertex().pull())
    }
  }

  revoke() {
    this.vertex.revoke()
  }

  private vertex: Vertex<any, V>
  private toVertex(): Vertex<any, V> {
    return this.vertex
  }

  constructor(vertex: Vertex<any, V>, actions?: any) {
    this.vertex = vertex
  }
}

export const defineResource = Resource.define
export const requestResource = Resource.request
