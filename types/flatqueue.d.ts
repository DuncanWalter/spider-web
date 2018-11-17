declare class FlatQueue<T> {
  constructor()
  push(id: number, value: T): void
  pop(): T
}

export = FlatQueue
