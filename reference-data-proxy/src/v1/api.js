const axios = require('axios');
require('dotenv').config();

const findACBSIndustrySector = async (industryId) => {
  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_UKEF_MDM_EA_URL}/map-industry-sector?ukefIndustryId=${industryId}`,
    auth: {
      username: process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_KEY,
      password: process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_SECRET,
    },
  }).catch((catchErr) => {
    console.error('Error calling Map Industry Sector API');
    return catchErr.response;
  });
  return response;
};

module.exports = {
  findACBSIndustrySector,
};
