/**
 * Validates payload against template
 * @param {Object} payload Payload to be validated
 * @param {Object} template Template to be used for validation
 * @returns {Boolean} Whether payload matches template
 */
const payloadVerification = (payload, template) => {
  if ((payload && template)
    && (Object.keys(payload).length > 0 && Object.keys(template).length > 0)) {
    // 1. Properties key validation
    const payloadKeys = Object.keys(payload);
    const templateKeys = Object.keys(template);

    const propertiesExists = templateKeys.every((propertyKey) => payloadKeys.includes(propertyKey));

    // 2. Ensure no additional properties
    const noAdditionalProperties = !payloadKeys.filter((propertyKey) => !templateKeys.includes(propertyKey)).length;

    // 3. Properties data type validation
    const propertiesDataTypeMatch = Object.keys(payload).every((key) => {
      const payloadKeyDataType = typeof payload[key];
      const templateKeyDataType = template[key] ? template[key].name : '';

      return payloadKeyDataType.toLowerCase() === templateKeyDataType.toLowerCase();
    });

    // Compound comparison condition
    return propertiesExists && noAdditionalProperties && propertiesDataTypeMatch;
  }

  return false;
};

module.exports = payloadVerification;
