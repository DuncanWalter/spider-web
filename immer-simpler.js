
const { isArray } = Array


function deepClone(target) {
    switch (true) {
        case target === null: return target
        case target === undefined: return target
        case typeof target === 'string': return target
        case typeof target === 'number': return target
        case typeof target === 'boolean': return target
        case isArray(target): {
            const newTarget = target.map(deepClone)
            newTarget.snap = newTarget.slice(0)
            return newTarget
        }
        case target instanceof Object: {
            const newTarget = {}
            for (let key of Object.keys(target)) {
                newTarget[key] = deepClone(target[key])
            }
            return newTarget
        }
        default: throw new Error('I only handle serializable JSON style data')
    }
}

function apply(source, draft) {
    if (!source || !draft) return draft
    if (!draft instanceof Object) return draft
    if (source === draft) return source

    if (isArray(source)) {
        if (!isArray(draft)) return draft

        const keys = new Map()
        const snap = draft.snap
        for (let i = 0; i < snap.length; i++) {
            keys.set(snap[i], source[i])
        }

        let dirty = draft.length !== source.length
        for (let i = 0; i < draft.length; i++) {
            draft[i] = apply(keys.get(draft[i]), draft[i])
            if (source[i] !== draft[i]) {
                dirty = true
            }
        }

        return dirty ? draft : source
    }

    if (source instanceof Object) {
        if (isArray(draft)) return draft

        let dirty = false
        const draftKeys = Object.keys(draft)
        for (const key of draftKeys) {
            draft[key] = apply(source[key], draft[key])
            if (draft[key] !== source[key]) {
                dirty = true
            }
        }
        if (dirty) return draft
        const sourceKeys = Object.keys(draft)
        if (draftKeys.length === sourceKeys.length) return source
        return draft
    }

    return draft
}

function produce(state, mutations) {
    const draft = deepClone(state)
    mutations(draft)
    return apply(state, draft)
}

const input = [{}, {}, {}];
const out = produce(input, draft => { draft.splice(1, 0, 'here') })

console.log(input[0] === out[0], input[1] === out[2])