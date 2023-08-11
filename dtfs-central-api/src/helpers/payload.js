/**
 * Validates payload against template
 * @param {Object} payload Payload to be validated
 * @param {Object} template Template to be used for validation
 * @returns {Boolean} Whether payload matches template
 */
const payloadVerification = (payload, template) => {
  if (Object.keys(payload).length > 0 && Object.keys(template).length > 0) {
    // 1. Properties key validation
    const payloadKeys = Object.keys(payload);
    const templateKeys = Object.keys(template);

    const propertiesExists = templateKeys.every((propertyKey) => payloadKeys.includes(propertyKey));

    // 2. Properties data type validation
    const templateDataType = Object.values(template).map((property) => property.name);
    const payloadDataType = Object.values(payload).map((property) => typeof property);

    const propertiesDataTypeMatch = templateDataType.every((dataType, index) => dataType.toLowerCase() === payloadDataType[index].toLowerCase());

    // Compound comparisson condition
    return propertiesExists && propertiesDataTypeMatch;
  }

  return false;
};

module.exports = payloadVerification;
