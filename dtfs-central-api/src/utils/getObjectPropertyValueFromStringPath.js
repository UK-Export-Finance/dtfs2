const getObjectPropertyValueFromStringPath = (obj, str) =>
  str.split('.').reduce((p, propertyName) => {
    if (p && p[propertyName]) {
      return p[propertyName];
    }
    return null;
  }, obj);

module.exports = getObjectPropertyValueFromStringPath;
