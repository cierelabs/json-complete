export default (message, operation, type) => {
    const error = new Error(message);
    error.operation = operation;
    error.type = type;
    return error;
};
