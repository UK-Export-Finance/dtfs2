const getObjectPropertyValueFromStringPath = (obj, str) =>
  str.split('.').reduce((p, propertyName) =>
    p[propertyName], obj);

module.exports = getObjectPropertyValueFromStringPath;
