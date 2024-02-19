const axios = require('axios');
const dotenv = require('dotenv');
const { isValidRegex } = require('../v1/validation/validateIds');
const { COUNTRY_CODE } = require('../constants/regex');

dotenv.config();

const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;
const headers = {
  'Content-Type': 'application/json',
  'x-api-key': EXTERNAL_API_KEY,
};

/**
 * Retrieves a list of countries from an external API.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of country objects.
 * @throws {Object} If there is an error retrieving the countries.
 */
const getCountries = async () => {
  const response = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/countries`,
    headers,
  }).catch((error) => {
    console.error('Error retrieving countries from External API %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get countries' };
  });

  return response?.data?.countries;
};

/**
 * Retrieves country information from an external API based on the provided country code.
 *
 * @param {string} code - The country code to retrieve information for.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status and data of the country.
 * @throws {Object} - If an error occurs while retrieving the country information.
 *
 * @example
 * // Returns { status: 200, data: { name: 'United States', population: 331002651, capital: 'Washington, D.C.' } }
 * getCountry('US');
 *
 * @example
 * // Returns { status: 404 }
 * getCountry('ZZ');
 */
const getCountry = async (code) => {
  if (!isValidRegex(COUNTRY_CODE, code)) {
    console.error('countries.getCountry: invalid code provided %s', code);
    return {
      status: 400,
    };
  }

  const response = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/countries/${code}`,
    headers,
  }).catch((error) => {
    console.error('Error retrieving country from External API %o', error);

    return {
      status: 404,
      error: 'Failed to get country',
    };
  });

  if (response.data) {
    return {
      status: 200,
      data: response.data,
    };
  }

  return {
    status: 404,
  };
};

module.exports = {
  getCountries,
  getCountry,
};
