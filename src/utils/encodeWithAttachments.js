export default (encodedBase, attachments) => {
    return attachments._keys.length === 0 ? encodedBase : encodedBase.concat([attachments._keys, attachments._values]);
};
