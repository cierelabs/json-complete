import encodeWithAttachments from '/utils/encodeWithAttachments.js';

export default (reference, attachments) => {
    return encodeWithAttachments([attachments._indices], attachments);
};
