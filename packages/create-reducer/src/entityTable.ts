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
        entityPair.lock += 1
        entityPair.entity = entity
      } else {
        state[key] = { lock: 1, entity }
      }
      return state
    },
    remove(state: EntityTable<Entity>, entity: Entity): EntityTable<Entity> {
      const key = getKey(entity)
      const entityPair = state[key]
      if (entityPair) {
        if (entityPair.lock == 1) {
          delete state[key]
        } else {
          entityPair.lock -= 1
        }
      }
      return state
    },
    delete(state: EntityTable<Entity>, key: string | number) {
      const entityPair = state[key]
      if (entityPair) {
        if (entityPair.lock == 1) {
          delete state[key]
        } else {
          entityPair.lock -= 1
        }
      }
      return state
    },
    update(state: EntityTable<Entity>, entity: Entity): EntityTable<Entity> {
      const key = getKey(entity)
      const entityPair = state[key]
      if (entityPair) {
        entityPair.entity = entity
      }
      return state
    },
  }
}
