/**
 * Construct expected properties payload to general consumption.
 * Method ensures only expected properties are added and any frivolous
 * properties are filtered out.
 * @param {Object} body Request body (req.body)
 * @param {Array} properties Interested properties to be added into payload
 * @param {boolean} csrf Include CSRF token, defaulted to `true`
 * @param {boolean} canPropertyBeEmpty Whether property can be empty in a payload
 * @returns {Object} Payload
 */
const constructPayload = (body, properties, canPropertyBeEmpty = false, csrf = true) => {
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
    .filter((property) => canPropertyBeEmpty || body[[property]] !== '')
    .forEach((property) => {
      payload = {
        ...payload,
        [property]: body[[property]],
      };
    });

  return payload;
};

module.exports = constructPayload;
