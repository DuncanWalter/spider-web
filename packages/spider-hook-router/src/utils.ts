export function isPromise(arg: unknown): arg is Promise<any> {
  return arg && Promise && arg instanceof Promise
}
