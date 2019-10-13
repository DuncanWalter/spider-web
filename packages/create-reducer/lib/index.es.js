var assign = Object.assign, create = Object.create, keys = Object.keys;
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
    var reducerName = typeof name === 'string' ? name : name.name;
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
        return handler.apply(void 0, [state].concat(action.payload));
    };
    var reducers = [reducer];
    var typeName;
    if (typeof name === 'function') {
        typeName = name;
    }
    else {
        typeName = defaultNamer(name);
    }
    var handlerKeys = {};
    var actions = {};
    var baseAction = Object.create(null, {
        reducers: { value: reducers },
    });
    var _loop_1 = function (key) {
        handlerKeys[typeName(key)] = key;
        actions[key] = function () {
            var payload = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                payload[_i] = arguments[_i];
            }
            return assign(create(baseAction), { type: typeName(key), payload: payload });
        };
    };
    for (var _i = 0, _a = keys(config); _i < _a.length; _i++) {
        var key = _a[_i];
        _loop_1(key);
    }
    Object.defineProperties(reducer, {
        name: { value: reducerName, enumerable: false },
        actions: { value: actions, enumerable: false },
    });
    return reducer;
}

function settable() {
    return {
        set: function (_, newState) {
            return newState;
        },
    };
}

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

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function entityTable(getKey) {
    return {
        add: function (state, entity) {
            var _a, _b;
            var key = getKey(entity);
            var entityPair = state[key];
            if (entityPair) {
                var lock = entityPair.lock, entity_1 = entityPair.entity;
                return __assign({}, state, (_a = {}, _a[key] = { lock: lock + 1, entity: entity_1 }, _a));
            }
            else {
                return __assign({}, state, (_b = {}, _b[key] = { lock: 1, entity: entity }, _b));
            }
        },
        remove: function (state, entity) {
            var _a;
            var key = getKey(entity);
            var entityPair = state[key];
            if (entityPair) {
                var lock = entityPair.lock, entity_2 = entityPair.entity;
                if (lock == 1) {
                    var newState = __assign({}, state);
                    delete newState[key];
                    return newState;
                }
                else {
                    return __assign({}, state, (_a = {}, _a[key] = { lock: lock - 1, entity: entity_2 }, _a));
                }
            }
            else {
                return state;
            }
        },
        delete: function (state, key) {
            var _a;
            var entityPair = state[key];
            if (entityPair) {
                var lock = entityPair.lock, entity = entityPair.entity;
                if (lock == 1) {
                    var newState = __assign({}, state);
                    delete newState[key];
                    return newState;
                }
                else {
                    return __assign({}, state, (_a = {}, _a[key] = { lock: lock - 1, entity: entity }, _a));
                }
            }
            else {
                return state;
            }
        },
        update: function (state, entity) {
            var _a;
            var key = getKey(entity);
            var entityPair = state[key];
            if (entityPair) {
                var lock = entityPair.lock;
                return __assign({}, state, (_a = {}, _a[key] = { lock: lock, entity: entity }, _a));
            }
            else {
                return state;
            }
        },
    };
}

function arraylike() {
    return {
        add: function (state, item) {
            var newState = state.slice();
            newState.push(item);
            return newState;
        },
        delete: function (state, index) {
            var length = state.length;
            if (length <= index || index < -length) {
                return state;
            }
            var newState = state.slice();
            newState.splice((index + length) % length, 1);
            return newState;
        },
        remove: function (state, item) {
            var index = state.indexOf(item);
            if (index < 0) {
                return state;
            }
            var newState = state.slice();
            newState.splice(index, 1);
            return newState;
        },
        update: function (state, index, item) {
            var length = state.length;
            if (length <= index || index < -length) {
                return state;
            }
            var newState = state.slice();
            newState[(index + length) % length] = item;
            return newState;
        },
    };
}

export { createReducer, settable, entityTable, arraylike };
