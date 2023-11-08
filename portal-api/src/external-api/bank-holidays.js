const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': EXTERNAL_API_KEY,
};

/**
 * Resolves to the response of `GET /bank-holidays` from external-api.
 * @returns {Promise<import('axios').AxiosResponse>}
 */
const getBankHolidays = () => axios.get(`${EXTERNAL_API_URL}/bank-holidays`, { headers });

module.exports = {
  getBankHolidays,
};
