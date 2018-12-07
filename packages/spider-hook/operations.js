import { b as createSlice } from './chunk2.js';
import './chunk.js';
import 'flatqueue';

function createOperation(mixin) {
    return {
        type: '@slice/operation',
        applied: false,
        operation: mixin,
    };
}

function joinOperations(...operations) {
    return {
        type: '@slice/operation-cluster',
        applied: false,
        operations,
    };
}

const map = createOperation({
    map(mapping) {
        return createSlice([this], u => mapping(u));
    },
});

const thru = createOperation({
    thru(binding) {
        return binding(this);
    },
});

// TODO: keyed forking
const fork = createOperation({
    fork(builder = i => i) {
        const forkedSlices = [];
        const root = createSlice([this], rawForks => {
            // TODO: remove slices when forks shrinks
            return rawForks.map((_, i) => {
                if (!forkedSlices[i]) {
                    forkedSlices[i] = builder(createSlice([this], forks => (i >= forks.length ? null : forks[i]), rawForks[i]));
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
const dedup = createOperation({
    dedup() {
        return createSlice([this], id);
    },
});

export { createOperation, joinOperations, map, thru, fork, dedup };
