import attachKeysStandard from '/utils/attachKeysStandard.js';
import attachIndices from '/utils/attachIndices.js';

export default (store, dataItem) => {
    attachIndices(store, dataItem);
    attachKeysStandard(store, dataItem);
};
