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
    status: err.response.status,
    data: {
      error: err.response.data.error.errorDescription,
    },
  }));

  return response;
};

const getCurrency = (currencyCode) => getAPI(`currency/${currencyCode}`);

const getACBSIndustrySector = async (industryId) => getAPI(`map-industry-sector?ukefIndustryId=${industryId}`);


module.exports = {
  getCurrency,
  getACBSIndustrySector,
};
