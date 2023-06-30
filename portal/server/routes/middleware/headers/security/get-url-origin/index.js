const isUrl = require('is-url');

/**
 * Get a URL's origin by splitting the following characters:
 * 1) /
 * 2) :
 * 3) .
 * This ensures that the split will work for all environments including localhost.
 * @param {String} URL
 * @returns {String} URL origin
 */
const getUrlOrigin = (url) => {
  if (isUrl(url)) {
    const origin = url.split(/[/:.]/);

    return origin[3];
  }

  return '';
};

module.exports = getUrlOrigin;
