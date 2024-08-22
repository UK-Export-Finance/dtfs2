const { getCountry } = require('../../controllers/countries.controller');

/**
 * Retrieves the disabled status of a country based on its country code.
 * @param {string} code - The country code.
 * @returns {Promise<boolean>} - The disabled status of the country.
 */
const isCountryDisabled = async (code) => {
  const { data } = await getCountry(code);
  return Boolean(data?.disabled);
};

module.exports = {
  isCountryDisabled,
};
