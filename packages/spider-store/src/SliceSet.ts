import { Slice, __Slice__ } from './slice'

interface Subscription {
  idx: number
  readonly slice: Slice
}

type ReadonlySubscription = Readonly<Subscription>

export { ReadonlySubscription as Subscription }

export class SliceSet {
  slices: Subscription[]

  constructor(slices?: Slice[]) {
    this.slices = slices
      ? slices.map((slice, idx) => ({
          idx,
          slice,
        }))
      : []
  }

  isEmpty(): boolean {
    return this.slices.length == 0
  }

  add(slice: Slice): Readonly<Subscription> {
    const slices = this.slices
    const subscription = {
      idx: slices.length,
      slice,
    }
    slices.push(subscription)
    return subscription
  }

  remove(subscription: Readonly<Subscription>): void {
    const slices = this.slices
    const idx = subscription.idx

    if (slices[idx] !== subscription) return

    const tail = slices[slices.length - 1]
    tail.idx = idx
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
      if (slices[i].slice == min.slice) {
        this.remove(slices[i--])
      } else if (slices[i].slice.depth < min.slice.depth) {
        min = slices[i]
      }
    }
    this.remove(min)
    return min.slice
  }
}
