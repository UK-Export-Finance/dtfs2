const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': String(EXTERNAL_API_KEY),
};

/**
 * Resolves to the response of `GET /companies-house/{companyRegistrationNumber}` from external-api.
 * @param {string} companyRegistrationNumber
 * @returns {Promise<import('axios').AxiosResponse>}
 */
const getCompanyProfileByCompanyRegistrationNumber = (companyRegistrationNumber) =>
  axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/companies-house/${companyRegistrationNumber}`,
    headers,
  });

module.exports = {
  getCompanyProfileByCompanyRegistrationNumber,
};
