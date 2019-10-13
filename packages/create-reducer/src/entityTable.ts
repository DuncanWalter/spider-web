export type EntityTable<Entity> = Record<
  string | number,
  { lock: number; entity: Entity }
>

export function entityTable<Entity>(
  getKey: (entity: Entity) => string | number,
) {
  return {
    add(state: EntityTable<Entity>, entity: Entity): EntityTable<Entity> {
      const key = getKey(entity)
      const entityPair = state[key]
      if (entityPair) {
        const { lock, entity } = entityPair
        return { ...state, [key]: { lock: lock + 1, entity } }
      } else {
        return { ...state, [key]: { lock: 1, entity } }
      }
    },
    remove(state: EntityTable<Entity>, entity: Entity): EntityTable<Entity> {
      const key = getKey(entity)
      const entityPair = state[key]
      if (entityPair) {
        const { lock, entity } = entityPair
        if (lock == 1) {
          const newState = { ...state }
          delete newState[key]
          return newState
        } else {
          return { ...state, [key]: { lock: lock - 1, entity } }
        }
      } else {
        return state
      }
    },
    delete(state: EntityTable<Entity>, key: string | number) {
      const entityPair = state[key]
      if (entityPair) {
        const { lock, entity } = entityPair
        if (lock == 1) {
          const newState = { ...state }
          delete newState[key]
          return newState
        } else {
          return { ...state, [key]: { lock: lock - 1, entity } }
        }
      } else {
        return state
      }
    },
    update(state: EntityTable<Entity>, entity: Entity): EntityTable<Entity> {
      const key = getKey(entity)
      const entityPair = state[key]
      if (entityPair) {
        const { lock } = entityPair
        return { ...state, [key]: { lock, entity } }
      } else {
        return state
      }
    },
  }
}
