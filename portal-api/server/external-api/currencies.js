const axios = require('axios');
const dotenv = require('dotenv');
const { HEADERS } = require('@ukef/dtfs2-common');
const { isValidCurrencyCode } = require('../v1/validation/validateIds');

dotenv.config();

const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;

const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  'x-api-key': String(EXTERNAL_API_KEY),
};

const getCurrencies = async () => {
  const response = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/currencies`,
    headers,
  }).catch((error) => {
    console.error('Error retrieving currencies from External API. %o %s', error?.response?.data, error?.status);
    return { status: error?.response?.status || 500, data: 'Failed to get currencies' };
  });

  return response.data && response.data.currencies;
};

const getCurrency = async (id) => {
  if (!isValidCurrencyCode(id)) {
    console.error('currencies.getCurrency: invalid code provided %s', id);
    return {
      status: 400,
    };
  }

  const response = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/currencies/${id}`,
    headers,
  }).catch((error) => {
    console.error('Error retrieving currency from External API. %o %s', error?.response?.data, error?.status);
    return {
      status: 404,
      error: 'Failed to get currency',
    };
  });

  if (response.data) {
    return {
      status: 200,
      data: response.data,
    };
  }

  return { status: 404 };
};

module.exports = {
  getCurrencies,
  getCurrency,
};
