import FlatQueue from 'flatqueue'

export class PrioritySet<T extends { id: number }> {
  set: Set<T>
  priorityQueue: FlatQueue

  constructor() {
    this.set = new Set()
    this.priorityQueue = new FlatQueue()
  }

  add(t: T) {
    if (!this.set.has(t)) {
      this.set.add(t)
      this.priorityQueue.add(t.id, t)
    }
  }

  has(t: T): boolean {
    return this.set.has(t)
  }

  pop(): T {
    const t = this.priorityQueue.popValue()
    this.set.delete(t)
    return t
  }

  get size() {
    return this.set.size
  }
}
