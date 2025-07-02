/**
 * Replaces all double quotes with single quotes with leading and trailing texts trimmed
 * @param {String} string
 * @returns {String} Replaced string without double quotes
 */
const stripDoubleQuotes = (string) => {
  return string.trim().replace(/"/g, "'");
};

module.exports = {
  stripDoubleQuotes,
};
