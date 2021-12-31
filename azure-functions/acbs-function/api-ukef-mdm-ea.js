const axios = require('axios');

require('dotenv').config();

const getAPI = async (type) => {
  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_UKEF_MDM_EA_URL}/${type}`,
    auth: {
      username: process.env.MULESOFT_API_UKEF_MDM_EA_KEY,
      password: process.env.MULESOFT_API_UKEF_MDM_EA_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => ({
    status: err.response
      ? err.response.status
      : err,
    data: {
      error: err.response
        ? err.response.data.error
        : err,
    },
  }));

  return response;
};

const getCurrency = (currencyCode) => getAPI(`currency?searchtext=${currencyCode}`);

const getACBSIndustrySector = async (industryId) => getAPI(`map-industry-sector?ukefIndustryId=${industryId}`);

const getACBSCountryCode = async (country) => getAPI(`country?searchtext=${country}`);

module.exports = {
  getCurrency,
  getACBSIndustrySector,
  getACBSCountryCode,
};
