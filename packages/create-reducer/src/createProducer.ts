export interface Producer {
  <T, O extends T = T>(operation: (t: O) => T, original: O): T
}

interface Reconciler {
  <T>(draft: T): T
}

export interface DraftSpec<T = unknown> {
  isMember(maybeMember: unknown): maybeMember is T
  clone(member: T, clone: <U>(original: U) => U): T
  reconcile(original: T, draft: T, reconcile: Reconciler): T
}

export function createProducer(draftSpecs: DraftSpec<any>[]): Producer {
  return function produce(operation, original) {
    const draftStorage = new Map()
    const deepClone = createDeepClone(draftSpecs, draftStorage)
    const deepReconcile = createDeepReconcile(draftSpecs, draftStorage)

    return deepReconcile(operation(deepClone(original)))
  }
}

export const arraySpec: DraftSpec<any[]> = {
  isMember: Array.isArray,
  clone(original, clone) {
    const draft = new Array(original.length)
    for (let i = 0; i < original.length; i++) {
      draft[i] = clone(original[i])
    }
    return draft
  },
  reconcile(original, draft, reconcile) {
    let dirty = false
    for (let i = 0; i < draft.length; i++) {
      draft[i] = reconcile(draft[i])

      if (draft[i] !== original[i]) {
        dirty = false
      }
    }
    if (!dirty && draft.length === original.length) {
      return original
    }
    return draft
  },
}

export const objectSpec: DraftSpec<Object> = {
  isMember(maybeObject): maybeObject is Object {
    return (
      typeof maybeObject === 'object' &&
      maybeObject !== null &&
      maybeObject.constructor === Object
    )
  },
  clone(original: any, clone) {
    const draft = {} as any
    const keys = Object.keys(original)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      draft[key] = clone(original[key])
    }
    return draft
  },
  reconcile(original: any, draft: any, reconcile) {
    let dirty = false
    const keys = Object.keys(draft)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      draft[key] = reconcile(draft[key])
      if (original[key] !== draft[key]) {
        dirty = true
      }
    }
    if (!dirty && Object.keys(original).length === keys.length) {
      return original
    }
    return draft
  },
}

function createDeepClone(
  draftSpecs: DraftSpec<any>[],
  draftStorage: Map<unknown, unknown>,
) {
  return function deepClone<T>(original: T): T {
    for (let i = 0; i < draftSpecs.length; i++) {
      const { isMember, clone } = draftSpecs[i]

      if (isMember(original)) {
        const draft = clone(original, deepClone)
        draftStorage.set(draft, original)
        return draft
      }
    }

    return original
  }
}

function createDeepReconcile(
  draftSpecs: DraftSpec<any>[],
  draftStorage: Map<unknown, unknown>,
): Reconciler {
  return function deepReconcile(draft) {
    for (let i = 0; i < draftSpecs.length; i++) {
      const { isMember, reconcile } = draftSpecs[i]

      if (isMember(draft)) {
        const stored = draftStorage.get(draft)

        if (stored !== undefined) {
          return reconcile(stored, draft, deepReconcile)
        }

        return draft
      }

      return draft
    }

    return draft
  }
}
