// TODO: only use from here (or a special types utils)
export type Just = number | string | symbol | Object

export function mapObjectProps<
  M extends { [props: string]: any },
  F extends (prop: M[keyof M], key: keyof M) => any
>(
  model: M,
  mapper: F,
  target: { [K in keyof M]?: ReturnType<F> } = {},
): { [K in keyof M]: ReturnType<F> } {
  for (const key of Object.keys(model)) {
    target[key] = mapper(model[key], key)
  }
  return target as any
}
