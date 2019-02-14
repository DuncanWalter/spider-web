import { Action } from '@dwalter/spider-store'
import { tuple } from './tuple'

interface AddEntity<Entity> extends Action {
  type: '@entity/add'
  entity: Entity
}

interface RemoveEntity<Entity> extends Action {
  type: '@entity/remove'
  entity: Entity
}

interface UpdateEntity<Entity> extends Action {
  type: '@entity/update'
  entity: Entity
}

type EntityAction<Entity> =
  | AddEntity<Entity>
  | RemoveEntity<Entity>
  | UpdateEntity<Entity>

/**
 * Creates a reducer and several actions for
 * a collection of entities which should not
 * be duplicated in state. Each entity is paired with a semaphore
 * so that it will not be removed while referenced from
 * elsewhere.
 * @param getKey function which maps entities to unique keys
 */
export function createEntityState<Entity>(
  getKey: (entity: Entity) => number | string,
) {
  const reducers = [reducer]
  function reducer(
    state: Record<string | number, [number, Entity]> = {},
    action: EntityAction<Entity>,
  ) {
    let key, entityPair
    switch (action.type) {
      case '@entity/add':
        key = getKey(action.entity)
        entityPair = state[key]
        if (entityPair) {
          const [semaphore, entity] = entityPair
          return { ...state, [key]: [semaphore + 1, entity] }
        } else {
          return { ...state, [key]: [1, action.entity] }
        }

      case '@entity/remove':
        key = getKey(action.entity)
        entityPair = state[key]
        if (entityPair) {
          const [semaphore, entity] = entityPair
          if (semaphore == 1) {
            const newState = { ...state }
            delete newState[key]
            return newState
          } else {
            return { ...state, [key]: [semaphore - 1, entity] }
          }
        } else {
          return state
        }

      case '@entity/update':
        key = getKey(action.entity)
        entityPair = state[key]
        if (entityPair) {
          const [semaphore] = entityPair
          return { ...state, [key]: [semaphore, action.entity] }
        } else {
          return state
        }

      default:
        return state
    }
  }

  return tuple(reducer, {
    add(entity: Entity): AddEntity<Entity> {
      return { type: '@entity/add', entity, reducers }
    },
    remove(entity: Entity): RemoveEntity<Entity> {
      return { type: '@entity/remove', entity, reducers }
    },
    update(entity: Entity): UpdateEntity<Entity> {
      return { type: '@entity/update', entity, reducers }
    },
  })
}
