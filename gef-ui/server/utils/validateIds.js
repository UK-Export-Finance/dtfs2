/**
 * isValidRegex
 * validates value conforms to passed regex rules
 * @param {String} regex
 * @param {String} value
 * @returns {Boolean} asserts if regex is matched or not
 */
const isValidRegex = (regex, value) => regex.test(value);

module.exports = {
  isValidRegex,
};
