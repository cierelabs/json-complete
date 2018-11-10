import getSystemName from '/utils/getSystemName.js';

export default (systemName) => {
    return (v) => {
        return getSystemName(v) === systemName;
    };
};
