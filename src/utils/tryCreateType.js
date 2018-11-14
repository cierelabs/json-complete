export default (typeOf, typeCreator) => {
    return typeOf === 'function' ? typeCreator() : {
        _identify: () => {},
    };
};
