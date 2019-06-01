import { Slice } from './slice'

type Subscription<V> = [number, Slice]

type ReadonlySubscription<V> = Readonly<Subscription<V>>

export { ReadonlySubscription as Subscription }

export class SwapSet<V> {
  slices: Subscription<V>[] = []

  isEmpty(): boolean {
    return this.slices.length == 0
  }

  add(slice: Slice): Readonly<Subscription<V>> {
    const slices = this.slices
    const subscription: Subscription<V> = [slices.length, slice]
    slices.push(subscription)
    return subscription
  }

  remove(subscription: Readonly<Subscription<V>>): void {
    const slices = this.slices
    const [idx] = subscription

    if (slices.length <= idx) return
    if (slices[idx] !== subscription) return

    const tail = slices[slices.length - 1]
    tail[0] = idx
    slices[idx] = tail

    slices.pop()
  }

  popMin(): Slice | null {
    const slices = this.slices
    if (slices.length == 0) {
      return null
    }
    let min = slices[0]
    for (let i = 1; i < slices.length; i++) {
      const [, slice] = slices[i]
      if (slice == min[1]) {
        this.remove(slices[i--])
      } else if (slice.depth < min[1].depth) {
        min = slices[i]
      }
    }
    this.remove(min)
    return min[1]
  }
}
