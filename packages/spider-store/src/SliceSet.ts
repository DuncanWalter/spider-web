import { Slice } from './slice'

type Subscription = [number, Slice]

type ReadonlySubscription = Readonly<Subscription>

export { ReadonlySubscription as Subscription }

export class SliceSet {
  slices: Subscription[] = []

  isEmpty(): boolean {
    return this.slices.length == 0
  }

  add(slice: Slice): Readonly<Subscription> {
    const slices = this.slices
    const subscription: Subscription = [slices.length, slice]
    slices.push(subscription)
    return subscription
  }

  remove(subscription: Readonly<Subscription>): void {
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
