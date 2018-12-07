import { a as resolveSlice } from './chunk.js';

class __Slice__ {
    constructor(dependencies, create, initialValue, shallow = true) {
        this.depth = 0;
        for (let i = 0; i < dependencies.length; i++) {
            if (this.depth < dependencies[i].depth) {
                this.depth = dependencies[i].depth;
            }
        }
        this.depth++;
        this.shallow = shallow;
        this.cachedOutput = initialValue || '@slice/invalid-cache';
        this.create = create;
        this.children = new Set();
        this.dependencies = dependencies;
    }
    dep(n) {
        return this.dependencies[n].cachedOutput;
    }
    tryUpdate() {
        const oldValue = this.cachedOutput;
        let newValue;
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
                newValue = this.create(...this.dependencies.map(dep => dep.cachedOutput));
            }
        }
        switch (true) {
            case newValue === null: {
                return false;
            }
            case newValue === undefined: {
                throw new Error('Slice emitted undefined. For noop explicitly return null.');
            }
            case this.shallow && newValue === oldValue: {
                return false;
            }
            default: {
                this.cachedOutput = newValue;
                return true;
            }
        }
    }
    subscribe(newChild) {
        if (this.children.size === 0) {
            this.dependencies.forEach(d => d.subscribe(this));
        }
        const content = resolveSlice(this);
        this.children.add(newChild);
        if (!(newChild instanceof __Slice__)) {
            newChild(content);
        }
    }
    unsubscribe(child) {
        this.children.delete(child);
        if (this.children.size === 0) {
            this.dependencies.forEach((d, i) => {
                d.unsubscribe(this);
            });
        }
    }
    use(...operations) {
        for (let set of operations) {
            if (set.applied) {
                continue;
            }
            else if (set.type === '@slice/operation-cluster') {
                for (let operation of set.operations) {
                    this.use(operation);
                }
            }
            else {
                Object.assign(__Slice__.prototype, set.operation);
            }
        }
        return this;
    }
}
function createSlice(dependencies, create, initialValue, shallow = true) {
    return new __Slice__(dependencies, create, initialValue, shallow);
}

export { __Slice__ as a, createSlice as b };
