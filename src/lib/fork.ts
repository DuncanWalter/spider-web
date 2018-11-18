import { Vertex } from '../vertex'

declare module '../vertex' {
  interface Vertex<Ds, V> {
    fork<U>(
      this: Vertex<Ds, V>,
      splitter: (v: V) => U[],
    ): Vertex<any, Vertex<any, U>[]>
  }
}

Vertex.prototype.fork = function<Ds extends Vertex<any, any>[], V, U>(
  this: Vertex<Ds, V>,
  splitter: (v: V) => U[],
) {
  const vertices: Vertex<any, U>[] = []
  let forks: U[]
  const root: Vertex<any, Vertex<any, U>[]> = new Vertex(
    [this],
    ([vs]) => {
      forks = splitter(vs)
      return forks.map((_, i) => {
        if (!vertices[i]) {
          vertices[i] = new Vertex([root], _ => {
            if (i >= forks.length) {
              console.warn('good to know...')
              return null
            } else {
              return forks[i]
            }
          })
        }
        return vertices[i]
      })
    },
    { initialValue: [] },
  )
  return root
}
