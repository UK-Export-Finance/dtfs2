const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': String(EXTERNAL_API_KEY),
};

/**
 * Returns an object with the `status` and `data` from the response from `GET /companies/{registrationNumber}` from external-api.
 * @param {string} registrationNumber
 * @returns {Promise<import('axios').AxiosResponse>}
 */
const getCompanyByRegistrationNumber = async (registrationNumber) => {
  try {
    const response = await axios.get(`${EXTERNAL_API_URL}/companies/${registrationNumber}`, { headers });

    return response;
  } catch (error) {
    const status = error?.response?.status || 500;
    const data = error?.response?.data || 'Error getting the company from External API';

    return { status, data };
  }
};

module.exports = {
  getCompanyByRegistrationNumber,
};
