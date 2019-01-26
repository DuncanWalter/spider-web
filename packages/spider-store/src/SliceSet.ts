import { Slice, __Slice__ } from './slice'

export class SliceSet {
  next: number | null
  size: number
  slices: (Slice | number | null)[]

  constructor(slices?: Slice[]) {
    this.slices = slices || []
    this.size = 0
    this.next = null
  }

  add(slice: Slice) {
    const index = this.has(slice)
    if (index !== false) return index
    this.size += 1
    if (this.next !== null) {
      const index = this.next
      this.next = this.slices[index] as number | null
      this.slices[index] = slice
      return index
    }
    this.slices.push(slice)
    return this.slices.length - 1
  }

  remove(i: number) {
    this.size -= 1
    this.slices[i] = this.next
    this.next = i
  }

  popMin() {
    if (this.size === 0) {
      return null
    }
    const slices = this.cleaned()
    let idx = 0
    let min = slices[0]
    for (let i = 1; i < slices.length; i++) {
      if (slices[i].depth < min.depth) {
        idx = i
        min = slices[i]
      }
    }
    this.remove(idx)
    return min
  }

  cleaned(): Slice[] {
    if (this.next === null) {
      return this.slices as Slice[]
    } else {
      this.next = null
      this.slices = this.slices.filter(elem => elem instanceof __Slice__)
      return this.slices as Slice[]
    }
  }

  has(slice: Slice): false | number {
    const slices = this.cleaned()
    for (let i = 0; i < slices.length; i++) {
      if (slices[i] === slice) {
        return i
      }
    }
    return false
  }
}
