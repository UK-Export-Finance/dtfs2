const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': String(EXTERNAL_API_KEY),
};

/**
 * Resolves to the response of `GET /geospatial/addresses/postcode/{postcode}` from external-api.
 * @param {string} postcode
 * @returns {Promise<import('axios').AxiosResponse>}
 */
const getAddressesByPostcode = (postcode) =>
  axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/geospatial/addresses/postcode${postcode}`,
    headers,
  });

module.exports = {
  getAddressesByPostcode,
};
