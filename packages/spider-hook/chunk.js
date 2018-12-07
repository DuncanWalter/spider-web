import * as FlatQueue from 'flatqueue';

var PrioritySet = /** @class */ (function () {
    function PrioritySet() {
        this.set = new Set();
        this.priorityQueue = new FlatQueue();
    }
    PrioritySet.prototype.add = function (t) {
        if (!this.set.has(t)) {
            this.set.add(t);
            this.priorityQueue.push(t, t.depth);
        }
    };
    PrioritySet.prototype.has = function (t) {
        return this.set.has(t);
    };
    PrioritySet.prototype.pop = function () {
        var t = this.priorityQueue.pop();
        this.set.delete(t);
        return t;
    };
    Object.defineProperty(PrioritySet.prototype, "size", {
        get: function () {
            return this.set.size;
        },
        enumerable: true,
        configurable: true
    });
    return PrioritySet;
}());

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

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function mark(v, marks) {
    if (v.children.size === 0 && !marks.has(v)) {
        marks.add(v);
        v.dependencies.forEach(function (dependency) {
            mark(dependency, marks);
        });
    }
}
function resolveSlice(slice) {
    var marks = new PrioritySet();
    mark(slice, marks);
    while (marks.size !== 0) {
        var node = marks.pop();
        node.tryUpdate();
    }
    return slice.cachedOutput;
}

function createRequester(cleanup) {
    var tasks = null;
    function execTasks() {
        var e_1, _a;
        try {
            for (var _b = __values(tasks), _c = _b.next(); !_c.done; _c = _b.next()) {
                var task = _c.value;
                task();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
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

export { __values as a, __read as b, __spread as c, resolveSlice as d, PrioritySet as e, createRequester as f };
