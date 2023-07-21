const { COMPANIES_HOUSE_NUMBER_REGEX } = require('../constants');

/**
 * isValidCompaniesHouseNumber
 * validates value conforms to passed regex rules
 * @param {String} value
 * @returns {Boolean} asserts if regex is matched or not
 */
const isValidCompaniesHouseNumber = (value) => COMPANIES_HOUSE_NUMBER_REGEX.test(value);

module.exports = {
  isValidCompaniesHouseNumber,
};
