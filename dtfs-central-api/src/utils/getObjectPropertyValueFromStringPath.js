const getObjectPropertyValueFromStringPath = (object, field) =>
  field.split('.').reduce((o, p) => {
    if (o && o[p] !== undefined) return o[p];
    return null;
  }, object);

module.exports = getObjectPropertyValueFromStringPath;
