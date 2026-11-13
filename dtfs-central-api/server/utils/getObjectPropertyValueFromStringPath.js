const getObjectPropertyValueFromStringPath = (object, field) =>
  field.split('.').reduce((previous, current) => {
    if (previous && previous[current] !== undefined) {
      return previous[current];
    }

    return null;
  }, object);

module.exports = getObjectPropertyValueFromStringPath;
