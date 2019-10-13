/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

function defaultNamer(prefix) {
    return function (name) {
        return "@" + prefix + "/" + name;
    };
}
/**
 * Function for declaring a reducer with behaviors for
 * a number of known actions.
 * @param name prefix for action types for logging purposes
 * @param initialState starting state of the reducer
 * @param config reducer behaviors for actions
 */
function createReducer(name, initialState, config) {
    var reducerName = typeof name === 'string' ? name : name.name + "Reducer";
    var handlerKeys = {};
    var reducer = function (state, action) {
        if (state === void 0) { state = initialState; }
        var handlerKey = handlerKeys[action.type];
        if (!handlerKey) {
            return state;
        }
        var handler = config[handlerKey];
        if (!handler) {
            return state;
        }
        return handler.apply(void 0, __spreadArrays([state], action.payload));
    };
    var reducers = [reducer];
    var typeName;
    if (typeof name === 'function') {
        typeName = name;
    }
    else {
        typeName = defaultNamer(name);
    }
    var actions = {};
    var _loop_1 = function (key) {
        var type = typeName(key);
        handlerKeys[type] = key;
        actions[key] = function () {
            var payload = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                payload[_i] = arguments[_i];
            }
            return { type: type, payload: payload, reducers: reducers };
        };
    };
    for (var _i = 0, _a = Object.keys(config); _i < _a.length; _i++) {
        var key = _a[_i];
        _loop_1(key);
    }
    Object.defineProperty(reducer, 'name', {
        value: reducerName,
        enumerable: false,
    });
    return [reducer, actions];
}

function settable() {
    return {
        set: function (_, newState) {
            return newState;
        },
    };
}

function entityTable(getKey) {
    return {
        add: function (state, entity) {
            var key = getKey(entity);
            var entityPair = state[key];
            if (entityPair) {
                entityPair.lock += 1;
                entityPair.entity = entity;
            }
            else {
                state[key] = { lock: 1, entity: entity };
            }
            return state;
        },
        remove: function (state, entity) {
            var key = getKey(entity);
            var entityPair = state[key];
            if (entityPair) {
                if (entityPair.lock == 1) {
                    delete state[key];
                }
                else {
                    entityPair.lock -= 1;
                }
            }
            return state;
        },
        delete: function (state, key) {
            var entityPair = state[key];
            if (entityPair) {
                if (entityPair.lock == 1) {
                    delete state[key];
                }
                else {
                    entityPair.lock -= 1;
                }
            }
            return state;
        },
        update: function (state, entity) {
            var key = getKey(entity);
            var entityPair = state[key];
            if (entityPair) {
                entityPair.entity = entity;
            }
            return state;
        },
    };
}

function arraylike() {
    return {
        add: function (state, item) {
            state.push(item);
            return state;
        },
        delete: function (state, index) {
            var length = state.length;
            if (length <= index || index < -length) {
                return state;
            }
            state.splice((index + length) % length, 1);
            return state;
        },
        remove: function (state, item) {
            var index = state.indexOf(item);
            if (index < 0) {
                return state;
            }
            state.splice(index, 1);
            return state;
        },
        update: function (state, index, item) {
            var length = state.length;
            if (length <= index || index < -length) {
                return state;
            }
            state[(index + length) % length] = item;
            return state;
        },
    };
}

function createDeepClone(draftSpecs, draftStorage) {
    return function deepClone(original) {
        for (var i = 0; i < draftSpecs.length; i++) {
            var _a = draftSpecs[i], isMember = _a.isMember, clone = _a.clone;
            if (isMember(original)) {
                var draft = clone(original, deepClone);
                draftStorage.set(draft, original);
                return draft;
            }
        }
        return original;
    };
}
function createDeepReconcile(draftSpecs, draftStorage) {
    return function deepReconcile(draft) {
        for (var i = 0; i < draftSpecs.length; i++) {
            var _a = draftSpecs[i], isMember = _a.isMember, reconcile = _a.reconcile;
            if (isMember(draft)) {
                var stored = draftStorage.get(draft);
                if (stored !== undefined) {
                    return reconcile(stored, draft, deepReconcile);
                }
                return draft;
            }
            return draft;
        }
        return draft;
    };
}
function createProducer(draftSpecs) {
    return function produce(operation, original) {
        var draftStorage = new Map();
        var deepClone = createDeepClone(draftSpecs, draftStorage);
        var deepReconcile = createDeepReconcile(draftSpecs, draftStorage);
        return deepReconcile(operation(deepClone(original)));
    };
}
var arraySpec = {
    isMember: Array.isArray,
    clone: function (original, clone) {
        var draft = new Array(original.length);
        for (var i = 0; i < original.length; i++) {
            draft[i] = clone(original[i]);
        }
        return draft;
    },
    reconcile: function (original, draft, reconcile) {
        var dirty = false;
        for (var i = 0; i < draft.length; i++) {
            draft[i] = reconcile(draft[i]);
            if (draft[i] !== original[i]) {
                dirty = false;
            }
        }
        if (!dirty && draft.length === original.length) {
            return original;
        }
        return draft;
    },
};
var objectSpec = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    isMember: function (maybeObject) {
        return (typeof maybeObject === 'object' &&
            maybeObject !== null &&
            maybeObject.constructor === Object);
    },
    clone: function (original, clone) {
        var draft = {};
        var keys = Object.keys(original);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            draft[key] = clone(original[key]);
        }
        return draft;
    },
    reconcile: function (original, draft, reconcile) {
        var dirty = false;
        var keys = Object.keys(draft);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            draft[key] = reconcile(draft[key]);
            if (original[key] !== draft[key]) {
                dirty = true;
            }
        }
        if (!dirty && Object.keys(original).length === keys.length) {
            return original;
        }
        return draft;
    },
};

function createDraftStateMiddleware(_a) {
    var _b = (_a === void 0 ? {} : _a).draftSpecs, draftSpecs = _b === void 0 ? [arraySpec, objectSpec] : _b;
    var draftStateMiddleware = function (store, _a) {
        var wrapReducer = _a.wrapReducer;
        var produce = createProducer(draftSpecs);
        return {
            wrapReducer: function (reducer) {
                var slice = wrapReducer(reducer);
                var nextState = slice.nextState;
                slice.nextState = function (oldState, actions) {
                    return produce(function (draftState) { return nextState(draftState, actions); }, oldState);
                };
                return slice;
            },
        };
    };
    return draftStateMiddleware;
}

export { createReducer, settable, entityTable, arraylike, createDraftStateMiddleware };
