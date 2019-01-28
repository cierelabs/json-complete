import extractPointer from '/utils/extractPointer.js';
import getDecoded from '/utils/getDecoded.js';

export default (store, dataItem, keyIndex, valueIndex) => {
    for (let i = 0; i < (dataItem._parts[keyIndex] || []).length; i += 1) {
        const keyPointer = dataItem._parts[keyIndex][i];

        // In compat mode, if Symbol types are not supported, but the encoded data uses a Symbol key, skip this entry
        if (store._compat && typeof Symbol !== 'function' && extractPointer(keyPointer)._key === 'P') {
            return;
        }

        dataItem._reference[getDecoded(store, keyPointer)] = getDecoded(store, dataItem._parts[valueIndex][i]);
    }
};
