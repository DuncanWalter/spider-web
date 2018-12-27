export function createScheduler<Task>(
  policy: (tasks: Task[]) => unknown,
): (task: Task) => void {
  let scheduled: Task[] | null = null

  function execTasks() {
    const running = scheduled!
    scheduled = null
    policy(running)
  }

  return function requestCall(callback) {
    if (!scheduled) {
      scheduled = [callback]
      setTimeout(execTasks, 0)
    } else {
      scheduled.push(callback)
    }
  }
}
