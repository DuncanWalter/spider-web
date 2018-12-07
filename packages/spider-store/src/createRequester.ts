export function createRequester(
  cleanup?: () => unknown,
): (callback: () => unknown) => void {
  let tasks: (() => unknown)[] | null = null

  function execTasks() {
    for (let task of tasks!) {
      task()
    }
    if (cleanup) {
      cleanup()
    }
    tasks = null
  }

  return function requestCall(callback) {
    if (!tasks) {
      tasks = [callback]
      setTimeout(execTasks, 0)
    } else {
      tasks.push(callback)
    }
  }
}
