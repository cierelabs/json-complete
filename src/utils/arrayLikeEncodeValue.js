import encounterItem from '/utils/encounterItem.js';

export default (store, dataItem) => {
    return [
        dataItem._indices.map((subValue) => {
            return encounterItem(store, subValue);
        }),
    ];
};
