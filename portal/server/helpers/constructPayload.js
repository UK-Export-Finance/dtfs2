/**
 * Construct expected properties payload to general consumption.
 * Method ensures only expected properties are added and any frivolous
 * properties are filtered out.
 * @param {Object} body Request body (req.body)
 * @param {Array} properties Interested properties to be added into payload
 * @param {Boolean} csrf Include CSRF token, defaulted to `true`
 * @returns {Object} Payload
 */
const constructPayload = (body, properties, csrf = true) => {
  let payload = {};

  // Return empty payload upon void mandatory arguments
  if (!body || !properties) {
    return payload;
  }

  // Ascertain CSRF inclusion
  if (csrf && body._csrf) {
    payload = {
      _csrf: body._csrf,
    };
  }

  // Property insertion
  properties
    .filter((property) => property in body)
    .forEach((property) => {
      payload = {
        ...payload,
        [property]: body[[property]],
      };

      return null;
    });

  return payload;
};

module.exports = constructPayload;
