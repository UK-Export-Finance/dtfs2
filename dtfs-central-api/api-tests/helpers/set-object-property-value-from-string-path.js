const setObjectPropertyValueFromStringPath = (object, path, value) => {
  let obj = object;
  const pathSegments = path.split('.');
  while (pathSegments.length - 1) {
    const pathSegment = pathSegments.shift();
    if (!(pathSegment in obj)) {
      obj[pathSegment] = {};
    }
    obj = obj[pathSegment];
  }
  obj[pathSegments[0]] = value;
};

module.exports = setObjectPropertyValueFromStringPath;
