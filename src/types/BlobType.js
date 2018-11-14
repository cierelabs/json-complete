import decodePointer from '/utils/decodePointer.js';
import genBlobLike from '/utils/genBlobLike.js';
import tryCreateType from '/utils/tryCreateType.js';

/* istanbul ignore next */
export default tryCreateType(typeof Blob, () => {
    return genBlobLike('Blob', ['type'], (store, buffer, dataArray) => {
        return new Blob(buffer, {
            type: decodePointer(store, dataArray[1]),
        });
    });
});
