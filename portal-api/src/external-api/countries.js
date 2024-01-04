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

const getCountries = async () => {
  const response = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/countries`,
    headers,
  }).catch((error) => {
    console.error('Error retrieving countries from External API %O ', { status: error?.response?.status, data: error?.response?.data });
    return { status: error?.response?.status || 500, data: 'Failed to get countries' };
  });

  return response.data && response.data.countries;
};

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
    console.error('Error retrieving country from External API %O ', { status: error?.response?.status, data: error?.response?.data });

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
