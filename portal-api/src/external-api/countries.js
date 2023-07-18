const axios = require('axios');
const dotenv = require('dotenv');

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
    return error?.response?.data;
  });

  return response.data && response.data.countries;
};

const getCountry = async (code) => {
  const response = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/countries/${code}`,
    headers,
  }).catch((error) => {
    console.error('Error retrieving country from External API %O ', { status: error?.response?.status, data: error?.response?.data });

    return error?.response?.data;
  });

  return response.data;
};

module.exports = {
  getCountries,
  getCountry,
};
