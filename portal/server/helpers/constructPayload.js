/**
 * Construct expected properties payload to general consumption.
 * Method ensures only expected properties are added and any frivolous
 * properties are filtered out.
 * @param {Object} body Request body (req.body)
 * @param {Array} properties Interested properties to be added into payload
 * @param {Boolean} csrf Include CSRF token, defaulted to `true`
 * @param {Boolean} canPropertyBeEmpty Whether property can be empty in a payload
 * @returns {Object} Payload
 */
const constructPayload = (body, properties, canPropertyBeEmpty = false, csrf = true) => {
  let payload = {};
  const bodyCopy = { ...body };
  // Return empty payload upon void mandatory arguments
  if (!body || !properties) {
    return payload;
  }

  // Remove empty properties if flag is set to true, for example currency field, and MongoDB doesn't allow type change.
  for (const property of properties) {
    if (canPropertyBeEmpty === false && bodyCopy[property] === '') {
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
