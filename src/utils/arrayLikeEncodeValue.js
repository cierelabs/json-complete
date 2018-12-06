import encounterItem from '/utils/encounterItem.js';

export default (store, dataItem) => {
    return [
        dataItem._indexed.map((subValue) => {
            return encounterItem(store, subValue);
        }),
    ];
};
