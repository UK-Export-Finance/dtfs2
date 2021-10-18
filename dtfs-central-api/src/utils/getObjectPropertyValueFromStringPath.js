const getObjectPropertyValueFromStringPath = (deal, field) =>
  field.split('.').reduce((o, p) => {
    if (o && o[p]) return o[p];
    return null;
  }, deal);

module.exports = getObjectPropertyValueFromStringPath;
