/**
 * Construct expected properties payload to general consumption.
 * Method ensures only expected properties are added and any frivolous
 * properties are filtered out.
 * @param {Object} body Request body (req.body)
 * @param {Array} properties Interested properties to be added into payload
 * @param {Boolean} csrf Include CSRF token, defaulted to `true`
 * @param {Boolean} propertyEmpty List of property names that can't have empty value as they will have object value later, defaulted to True
 * @returns {Object} Payload
 */
const constructPayload = (body, properties, propertyEmpty, csrf = true) => {
  let payload = {};
  const bodyCopy = { ...body };
  // Return empty payload upon void mandatory arguments
  if (!body || !properties) {
    return payload;
  }

  // Currency will be an object, don't save as empty string, because MongoDB can't change the type.
  for (const property of properties) {
    if (propertyEmpty && bodyCopy[property] === '') {
      delete bodyCopy[property];
    }
  }

  // Ascertain CSRF inclusion
  if (csrf && body._csrf) {
    payload = {
      _csrf: body._csrf,
    };
  }

  // Property insertion
  properties
    .filter((property) => property in bodyCopy)
    .forEach((property) => {
      payload = {
        ...payload,
        [property]: bodyCopy[[property]],
      };
    });

  return payload;
};

module.exports = constructPayload;
