declare module 'flatqueue' {
  class FlatQueue<T> {
    constructor()
    push(id: T, value: number): void
    pop(): T
  }
  namespace FlatQueue {

  }
  export = FlatQueue
}
