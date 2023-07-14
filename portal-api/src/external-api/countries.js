const axios = require('axios');
const dotenv = require('dotenv');
const { isValidRegex } = require('../v1/validation/validateIds');
const { CODE } = require('../constants/regex');

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
  }).catch((err) => {
    console.error('Error retrieving countries from External API %O ', { status: err?.response?.status, data: err?.response?.data });
    return err?.response?.data;
  });

  return response.data && response.data.countries;
};

const getCountry = async (code) => {
  if (!isValidRegex(CODE, code)) {
    console.error('countries.getCountry: invalid code provided %s', code);
    return {
      status: 400
    };
  }

  const response = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/countries/${code}`,
    headers,
  }).catch((err) => {
    console.error('Error retrieving country from External API %O ', { status: err?.response?.status, data: err?.response?.data });

    return {
      status: 404,
      error: err?.response?.data,
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
