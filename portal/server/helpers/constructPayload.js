/**
 * Construct expected properties payload to general consumption.
 * Method ensures only expected properties are added and any frivolous
 * properties are filtered out.
 * @param {Object} body Request body (req.body)
 * @param {Array} properties Interested properties to be added into payload
 * @param {Boolean} csrf Include CSRF token, defaulted to `true`
 * @param {Array} unsetIfPropertyIsEmpty The condition to determine whether to delete the property
 * @returns {Object} Payload
 */
const constructPayload = (body, properties, unsetIfPropertyIsEmpty = [], csrf = true) => {
  let payload = {};
  const newObj = { ...body };
  // Return empty payload upon void mandatory arguments
  if (!body || !properties) {
    return payload;
  }

  // Currency will be an object, don't save as empty string, because Mongo DB can't change type.
  for (const property of unsetIfPropertyIsEmpty) {
    if (newObj[property] === '') {
      delete newObj[property];
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
    .filter((property) => property in newObj)
    .forEach((property) => {
      payload = {
        ...payload,
        [property]: newObj[[property]],
      };
    });

  return payload;
};

module.exports = constructPayload;
