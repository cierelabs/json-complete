import decodePointer from '/utils/decodePointer.js';
import genBlobLike from '/utils/genBlobLike.js';

/* istanbul ignore next */
export default genBlobLike('Blob', ['type'], (store, buffer, dataArray) => {
    return new Blob(buffer, {
        type: decodePointer(store, dataArray[1]),
    });
});
