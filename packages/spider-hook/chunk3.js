function createRequester(cleanup) {
    let tasks = null;
    function execTasks() {
        for (let task of tasks) {
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

export { createRequester as a };
