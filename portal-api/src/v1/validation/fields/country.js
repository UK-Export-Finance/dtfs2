const { getCountry } = require('../../controllers/countries.controller');

/**
 * Determines if a country is disabled based on its code.
 *
 * @param {string} code - The country code.
 * @returns {boolean} - True if the country is disabled, false otherwise.
 */
module.exports.countryIsDisabled = (code) => {
  const { data: country } = getCountry(code);
  return country?.disabled;
};
