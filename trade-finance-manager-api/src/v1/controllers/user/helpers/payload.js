/**
 * Validates payload against template
 * @param {Object} payload Payload to be validated
 * @param {Object} template Template to be used for validation
 * @returns {Boolean} Whether payload matches template
 */
const payloadVerification = (payload, template) => {
  if (!payload
    || !template
    || !Object.keys(payload).length
    || !Object.keys(template).length) {
    return false;
  }

  // 1. Properties key validation
  const payloadKeys = Object.keys(payload);
  const templateKeys = Object.keys(template);

  const propertiesExists = templateKeys.every((propertyKey) => payloadKeys.includes(propertyKey));

  // 2. Ensure no additional properties
  const noAdditionalProperties = !payloadKeys.filter((propertyKey) => !templateKeys.includes(propertyKey)).length;

  // 3. Properties data type validation
  const propertiesDataTypeMatch = payloadKeys.every((key) => {
    const payloadKeyDataType = typeof payload[key];
    const templateKeyDataType = template[key] ? template[key].name : '';

    return payloadKeyDataType.toLowerCase() === templateKeyDataType.toLowerCase();
  });

  if(!propertiesExists) {
    console.error('ERROR no required property', propertiesExists);
  }
  if(!noAdditionalProperties) {
    console.error('ERROR extra properties', noAdditionalProperties);
  }
  if(!propertiesDataTypeMatch) {
    console.error('Error property type is wrong', propertiesDataTypeMatch);
  }

  // Compound comparison condition
  return propertiesExists && noAdditionalProperties && propertiesDataTypeMatch;
};

module.exports = payloadVerification;
