var colorRegExp = /\u001b\[\d\d?m/g;

function removeColors(str) {
  return str.replace(colorRegExp, '');
}

function getConstructorOf(obj) {
  while (obj) {
    var descriptor = Object.getOwnPropertyDescriptor(obj, 'constructor');
    if (descriptor !== undefined &&
      typeof descriptor.value === 'function' &&
      descriptor.value.name !== '') {
      return descriptor.value;
    }

    obj = Object.getPrototypeOf(obj);
  }

  return null;
}

module.exports = {
  removeColors: removeColors,
  getConstructorOf: getConstructorOf
};
