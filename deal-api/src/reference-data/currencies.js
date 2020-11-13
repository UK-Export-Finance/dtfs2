
const axios = require('axios');

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

const getCurrencies = async () => {
  console.log(`getCurrencies: ${referenceProxyUrl}/currencies`);
  const response = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/currencies`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => err);

  console.log('getCurrenciesResponse', response);

  return response.data && response.data.currencies;
};

const getCurrency = async (id) => {
  console.log(`getCurrency: ${referenceProxyUrl}/currencies/${id}`);
  const response = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/currencies/${id}`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => err);
  console.log(`getCurrency ${id}`, response);

  return response.data;
};

module.exports = {
  getCurrencies,
  getCurrency,
};
