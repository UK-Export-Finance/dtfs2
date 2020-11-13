
const axios = require('axios');

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

const getCountries = async () => {
  console.log(`getCountries: ${referenceProxyUrl}/countries`);
  const response = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/countries`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => err);
  console.log('getCountriesResponse', response);
  return response.data && response.data.countries;
};

const getCountry = async (code) => {
  console.log(`getCountry: ${referenceProxyUrl}/countries/${code}`);
  const response = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/countries/${code}`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => err);
  console.log(`getCountryResponse ${code}`, response);
  return response.data;
};

module.exports = {
  getCountries,
  getCountry,
};
