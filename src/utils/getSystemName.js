export default (v) => {
    return Object.prototype.toString.call(v).slice(8, -1);
};
