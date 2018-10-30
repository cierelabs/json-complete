export default (pointer) => {
    return {
        key: pointer.substring(0, 2),
        index: parseInt(pointer.substring(2), 10),
    };
};
