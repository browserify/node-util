
module.exports = function isFunctionLengthConfigurable(arg) {
    return Object.getOwnPropertyDescriptor(function () { }, 'length').configurable;
}