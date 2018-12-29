export function createScheduler<Task, Result>(
  policy: (tasks: Task[]) => Result,
): (task: Task) => Promise<Result> {
  let scheduled: Task[] | null = null
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

  return function requestCall(callback) {
    if (!scheduled) {
      scheduled = [callback]
      setTimeout(execTasks, 0)
      return (promise = new Promise(r => (resolve = r)))
    } else {
      scheduled.push(callback)
      return promise!
    }
  }
}
