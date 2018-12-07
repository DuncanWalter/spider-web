var SliceSet = /** @class */ (function () {
    function SliceSet(slices) {
        this.slices = slices || [];
        this.size = 0;
        this.next = null;
    }
    SliceSet.prototype.add = function (slice) {
        this.size += 1;
        if (this.next !== null) {
            var index = this.next;
            var next = this.slices[index];
            this.slices[index] = slice;
            this.next = next;
            return index;
        }
        this.slices.push(slice);
        return this.slices.length - 1;
    };
    SliceSet.prototype.remove = function (i) {
        this.size -= 1;
        this.slices[i] = this.next;
        this.next = i;
    };
    SliceSet.prototype.pop = function () {
        if (this.size === 0) {
            return null;
        }
        var slices = this.cleaned();
        var idx = 0;
        var min = slices[0];
        for (var i = 1; i < slices.length; i++) {
            if (slices[i].depth < min.depth) {
                idx = i;
                min = slices[i];
            }
        }
        this.remove(idx);
        return min;
    };
    SliceSet.prototype.take = function () {
        if (this.size === 0) {
            return null;
        }
        this.size -= 1;
        return this.cleaned().pop();
    };
    SliceSet.prototype.cleaned = function () {
        if (this.next === null) {
            return this.slices;
        }
        else {
            this.next = null;
            this.slices = this.slices.filter(function (elem) { return elem instanceof __Slice__; });
            return this.slices;
        }
    };
    SliceSet.prototype.has = function (slice) {
        var slices = this.cleaned();
        for (var i = 0; i < slices.length; i++) {
            if (slices[i] === slice) {
                return true;
            }
        }
        return false;
    };
    return SliceSet;
}());

function mark(v, marks) {
    if (v.children.size === 0 && !marks.has(v)) {
        marks.add(v);
        v.dependencies.forEach(function (dependency) {
            mark(dependency, marks);
        });
    }
}
function resolveSlice(slice) {
    var marks = new SliceSet();
    mark(slice, marks);
    while (marks.size !== 0) {
        var node = marks.take();
        node.tryUpdate();
    }
    return slice.cachedOutput;
}

var depth = 0;
var __Slice__ = /** @class */ (function () {
    function __Slice__(dependencies, create, initialValue, shallow) {
        if (shallow === void 0) { shallow = true; }
        this.depth = ++depth;
        this.shallow = shallow;
        this.cachedOutput = initialValue || '@slice/invalid-cache';
        this.create = create;
        this.children = new SliceSet();
        this.dependencies = dependencies;
        this.subscriptions = null;
    }
    __Slice__.prototype.dep = function (n) {
        return this.dependencies[n].cachedOutput;
    };
    __Slice__.prototype.tryUpdate = function () {
        var oldValue = this.cachedOutput;
        var newValue;
        switch (this.dependencies.length) {
            case 0: {
                newValue = this.create();
                break;
            }
            case 1: {
                newValue = this.create(this.dep(0));
                break;
            }
            case 2: {
                newValue = this.create(this.dep(0), this.dep(1));
                break;
            }
            case 3: {
                newValue = this.create(this.dep(0), this.dep(1), this.dep(2));
                break;
            }
            default: {
                newValue = this.create.apply(this, this.dependencies.map(function (dep) { return dep.cachedOutput; }));
            }
        }
        if (newValue === null) {
            return false;
        }
        if (newValue === undefined) {
            return false;
        }
        if (this.shallow && newValue === oldValue) {
            return false;
        }
        this.cachedOutput = newValue;
        return true;
    };
    __Slice__.prototype.subscribe = function (newChild) {
        var _this = this;
        if (this.children.size === 0) {
            this.subscriptions = this.dependencies.map(function (d) { return d.subscribe(_this); });
        }
        var content = resolveSlice(this);
        if (newChild instanceof __Slice__) {
            return this.children.add(newChild);
        }
        else {
            newChild(content);
            return this.children.add(createSlice([this], newChild));
        }
    };
    __Slice__.prototype.unsubscribe = function (subscription) {
        var _this = this;
        this.children.remove(subscription);
        if (this.children.size === 0) {
            this.dependencies.forEach(function (d, i) {
                d.unsubscribe(_this.subscriptions[i]);
            });
            this.subscriptions = null;
        }
    };
    __Slice__.prototype.use = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        for (var _a = 0, operations_1 = operations; _a < operations_1.length; _a++) {
            var set = operations_1[_a];
            if (set.applied) {
                continue;
            }
            else if (set.type === '@slice/operation-cluster') {
                for (var _b = 0, _c = set.operations; _b < _c.length; _b++) {
                    var operation = _c[_b];
                    this.use(operation);
                }
            }
            else {
                Object.assign(__Slice__.prototype, set.operation);
            }
        }
        return this;
    };
    return __Slice__;
}());
function createSlice(dependencies, create, initialValue, shallow) {
    if (shallow === void 0) { shallow = true; }
    return new __Slice__(dependencies, create, initialValue, shallow);
}

function updateSlice(slice, marks) {
    var updated = slice.tryUpdate();
    if (updated) {
        var children = slice.children.cleaned();
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            if (child.dependencies.length === 1) {
                updateSlice(child, marks);
            }
            else if (child.dependencies[0] === slice) {
                marks.add(child);
            }
        }
    }
}
function propagateSlice(marks) {
    while (marks.size !== 0) {
        updateSlice(marks.pop(), marks);
    }
}

function createRequester(cleanup) {
    var tasks = null;
    function execTasks() {
        for (var _i = 0, _a = tasks; _i < _a.length; _i++) {
            var task = _a[_i];
            task();
        }
        if (cleanup) {
            cleanup();
        }
        tasks = null;
    }
    return function requestCall(callback) {
        if (!tasks) {
            tasks = [callback];
            setTimeout(execTasks, 0);
        }
        else {
            tasks.push(callback);
        }
    };
}

var sliceKey = '@store/slices';
function getMaster(store) {
    var s = store;
    while (s.master !== s) {
        s = s.master;
    }
    return s;
}
function createStore() {
    var store = {
        slices: [],
    };
    store.master = store;
    var marks = new SliceSet();
    var requestResolve = createRequester(function () {
        propagateSlice(marks);
        marks = new SliceSet();
    });
    var dispatch = function (action) {
        if (action instanceof Promise) {
            return new Promise(function (resolve) {
                action.then(function (action) { return dispatch(action).then(resolve); });
            });
        }
        if (action instanceof Function) {
            return action(dispatch);
        }
        getMaster(store).slices.forEach(function (slice) { return slice(action, marks); });
        return new Promise(requestResolve);
    };
    store.dispatch = dispatch;
    function wrapReducer(reducer, config) {
        if (config === void 0) { config = {}; }
        var _a = config.shallow, shallow = _a === void 0 ? true : _a, initialState = config.initialState;
        var state = initialState || reducer(undefined, { type: '@store/init' });
        var resource = createSlice([], function (_) { return state; }, state, shallow);
        store.slices.push(function (action, marks) {
            var oldState = state;
            var newState = (state = reducer(state, action));
            if (newState === undefined) {
                throw new Error('Reducer returned undefined');
            }
            if (!shallow || newState !== oldState) {
                marks.add(resource);
            }
        });
        return resource;
    }
    store.wrapReducer = wrapReducer;
    return store;
}

function mergeStores() {
    var stores = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        stores[_i] = arguments[_i];
    }
    if (stores.length <= 1) {
        return;
    }
    var master = stores[0], children = stores.slice(1);
    children.forEach(function (child) {
        var _a;
        var oldMaster = getMaster(child);
        oldMaster.master = master;
        if (master.slices.indexOf(oldMaster.slices[0]) < 0) {
            (_a = master.slices).push.apply(_a, oldMaster.slices);
        }
    });
}

function createOperation(mixin) {
    return {
        type: '@slice/operation',
        applied: false,
        operation: mixin,
    };
}

function joinOperations() {
    var operations = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        operations[_i] = arguments[_i];
    }
    return {
        type: '@slice/operation-cluster',
        applied: false,
        operations: operations,
    };
}

var map = createOperation({
    map: function (mapping) {
        return createSlice([this], function (u) { return mapping(u); });
    },
});

var thru = createOperation({
    thru: function (binding) {
        return binding(this);
    },
});

// TODO: keyed forking
var fork = createOperation({
    fork: function (builder) {
        var _this = this;
        if (builder === void 0) { builder = function (i) { return i; }; }
        var forkedSlices = [];
        var root = createSlice([this], function (rawForks) {
            // TODO: remove slices when forks shrinks
            return rawForks.map(function (_, i) {
                if (!forkedSlices[i]) {
                    forkedSlices[i] = builder(createSlice([_this], function (forks) { return (i >= forks.length ? null : forks[i]); }, rawForks[i]));
                }
                return forkedSlices[i];
            });
        });
        return root;
    },
});

function id(t) {
    return t;
}
var dedup = createOperation({
    dedup: function () {
        return createSlice([this], id);
    },
});

export { resolveSlice, sliceKey, getMaster, createStore, mergeStores, createOperation, joinOperations, map, thru, fork, dedup };
