const isUrl = require('is-url');
const getUrlOrigin = require('../get-url-origin');

/**
 * Check if a request header's origin is:
 * 1) A valid URL
 * 2) Matches the services' origin
 * @param {String} URL
 * @returns {String} URL origin
 */
const isRequestHeaderOriginValid = (origin, requestHeader) => {
  if (isUrl(requestHeader)) {
    const requestOrigin = getUrlOrigin(requestHeader);

    if (requestOrigin === origin) {
      return true;
    }
  }

  return false;
};

module.exports = isRequestHeaderOriginValid;
