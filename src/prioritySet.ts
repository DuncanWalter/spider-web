import * as FlatQueue from 'flatqueue'

export class PrioritySet<T extends { depth: number }> {
  set: Set<T>
  priorityQueue: FlatQueue<T>

  constructor() {
    this.set = new Set()
    this.priorityQueue = new FlatQueue<T>()
  }

  add(t: T) {
    if (!this.set.has(t)) {
      this.set.add(t)
      this.priorityQueue.push(t, t.depth)
    }
  }

  has(t: T): boolean {
    return this.set.has(t)
  }

  pop(): T {
    const t = this.priorityQueue.pop()
    this.set.delete(t)
    return t
  }

  get size() {
    return this.set.size
  }
}
