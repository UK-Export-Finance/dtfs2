/**
 * Transform array of string booleans into array of booleans
 * Or transform string booleans into booleans
 *
 * @param {array/string} hasBeenIssued
 * @example ( ['true', 'false'] )
 * @returns [true, false]
 * @example ( 'false' )
 * @returns false
 */
const sanitiseHasBeenIssued = (hasBeenIssued) => {
  let sanitised = hasBeenIssued;

  if (Array.isArray(hasBeenIssued)) {
    sanitised = [];

    hasBeenIssued.forEach((value) => {
      if (value === 'true') {
        sanitised.push(true);
      }
      if (value === 'false') {
        sanitised.push(false);
      }
    });
  }

  if (hasBeenIssued === 'true') {
    return true;
  }
  if (hasBeenIssued === 'false') {
    return false;
  }

  return sanitised;
};

/**
 * Sanitise req.body
 * @param {object} body
 * @example ( { keyword: 'mock', hasBeenIssued: ['true', 'false'] } )
 * @returns { keyword: 'mock', hasBeenIssued: [true, false] }
 */
const sanitiseBody = (body) => {
  const sanitised = body;

  if (body.hasBeenIssued) {
    sanitised.hasBeenIssued = sanitiseHasBeenIssued(body.hasBeenIssued);
  }

  return sanitised;
};

module.exports = {
  sanitiseHasBeenIssued,
  sanitiseBody,
};
