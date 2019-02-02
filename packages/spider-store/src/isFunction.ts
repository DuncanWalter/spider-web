type FunctionSubset<T> = T extends Function ? T : never

export function isFunction<T>(f: T): f is FunctionSubset<T> {
  return typeof f == 'function'
}
