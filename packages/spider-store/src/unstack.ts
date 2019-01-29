export function unstack<A>(fun: (a: A) => void) {
  const queue = [] as A[]
  let running = false
  return (a: A) => {
    queue.unshift(a)
    if (!running) {
      running = true
      while (queue.length) {
        fun(queue.pop()!)
      }
      running = false
    }
  }
}
