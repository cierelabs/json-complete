import isAttachable from '/src/utils/isAttachable.mjs';
import isDeferrable from '/src/utils/isDeferrable.mjs';
import isSimple from '/src/utils/isSimple.mjs';
import getAttachments from '/src/utils/getAttachments.mjs';
import getPointerKey from '/src/utils/getPointerKey.mjs';
import types from '/src/utils/types.mjs';

const prepExplorableItem = (store, item) => {
    if (store._.references.get(item) === void 0 && !isSimple(getPointerKey(item))) {
        store._.explore.push(item);
    }
};

export default (store, item) => {
    const pointerKey = getPointerKey(item);

    if (isSimple(pointerKey)) {
        return pointerKey;
    }

    const existingDataItem = store._.references.get(item);

    if (existingDataItem !== void 0) {
        return existingDataItem.pointer;
    }

    // Ensure location exists
    store[pointerKey] = store[pointerKey] || [];

    // Add temp value to update the location
    store[pointerKey].push(void 0);

    const pointerIndex = store[pointerKey].length - 1;

    const dataItem = {
        key: pointerKey,
        index: pointerIndex,
        pointer: `${pointerKey}${pointerIndex}`,
        value: item,
        indices: [],
        attachments: [],
    };

    // Store the reference uniquely along with location information
    store._.references.set(item, dataItem);

    /* istanbul ignore next */
    if (isDeferrable(pointerKey)) {
        store._.deferred.push(dataItem);
    }

    if (isAttachable(pointerKey)) {
        let { indices, attachments } = getAttachments(item);

        // Object-wrapped Strings will include indices for each character in the string
        if (types[pointerKey].ignoreIndices) {
            indices = [];
        }

        // Save the known attachments for the next phase so we do not have to reacquire them
        dataItem.indices = indices;
        dataItem.attachments = attachments;

        // Prep sub-items to be explored later
        indices.forEach((s) => {
            prepExplorableItem(store, s);
        });
        attachments.forEach((s) => {
            prepExplorableItem(store, s[0]);
            prepExplorableItem(store, s[1]);
        });
    }

    return dataItem.pointer;
};
