const getObjectPropertyValueFromString = (obj, str) =>
  str.split('.').reduce((p, propertyName) =>
    p[propertyName], obj);

module.exports = getObjectPropertyValueFromString;
