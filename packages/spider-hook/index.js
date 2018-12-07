import { useEffect, useState } from 'react';
import { createRequester, resolveSlice } from '@dwalter/spider-store';

var requestUpdate = createRequester();
function useSlice(slice) {
    var innerSlice = useState(slice)[0];
    var _a = useState(function () { return resolveSlice(innerSlice); }), state = _a[0], setState = _a[1];
    useEffect(function () {
        var subscription = innerSlice.subscribe(function (v) {
            if (v !== state || !innerSlice.shallow) {
                requestUpdate(function () { return setState(v); });
            }
        });
        return function () {
            innerSlice.unsubscribe(subscription);
        };
    }, [innerSlice]);
    return state;
}

export { useSlice };
