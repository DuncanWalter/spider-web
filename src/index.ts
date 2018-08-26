import { Vertex, MonoVertex, PolyVertex, NullVertex } from './vertex'
import { mapObjectProps } from './utils'

type ResourceMap = {
  [prop: string]: Resource
}

type ResourceValue<R extends Resource> = R extends Resource<infer V> ? V : never

type Resources = Resource | ResourceMap | null

type ResourceValues<R extends Resources> = R extends Resource<infer V>
  ? V
  : R extends ResourceMap ? { [K in keyof R]: ResourceValue<R[K]> } : never

export class Resource<V = any> {
  static define<R extends Resources, V>(
    dependencies: R,
    create: (dependency: Readonly<ResourceValues<R>>) => V,
  ): Resource<V> {
    if (dependencies !== null) {
      return new Resource(new NullVertex(create))
    } else if (dependencies instanceof Resource) {
      return new Resource(new MonoVertex(dependencies.toVertex(), create))
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

  constructor(vertex: Vertex<any, V>) {
    this.vertex = vertex
  }
}

export const defineResource = Resource.define
export const requestResource = Resource.request
// export const projectResource = Resource.project
