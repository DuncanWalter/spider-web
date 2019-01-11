function toArray<AL extends ArrayLike<any[]>>(
  arrayLike: AL,
): AL extends ArrayLike<infer Ts> ? Ts : never {
  return Array.prototype.slice.call(arrayLike) as any
}

export function createScheduler<TaskArgs extends any[], Result>(
  policy: (tasks: TaskArgs[]) => Result,
): (...taskArgs: TaskArgs) => Promise<Result> {
  let scheduled: TaskArgs[] | null = null
  let promise: Promise<Result> | null = null
  let resolve: ((result: Result) => void) | null = null

  function execTasks() {
    const running = scheduled!
    const cleanup = resolve!
    scheduled = null
    promise = null
    resolve = null
    cleanup(policy(running))
  }

  return function requestCall() {
    if (!scheduled) {
      scheduled = [toArray(arguments)]
      setTimeout(execTasks, 0)
      return (promise = new Promise(r => (resolve = r)))
    } else {
      scheduled.push(toArray(arguments))
      return promise!
    }
  }
}
