require('dotenv').config();
const axios = require('axios');

const headers = {
  [String(process.env.APIM_MDM_KEY)]: process.env.APIM_MDM_VALUE,
};

/**
 * APIM MDM `GET` generic endpoint invocation call
 * @param {string} endpoint Endpoint with provided query parameters
 * @returns Response object
 */
const getAPI = async (endpoint) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${process.env.APIM_MDM_URL}${endpoint}`,
      headers,
    }).catch((error) => ({
      status: error.response ? error.response.status : error,
      data: {
        error: error.response ? error.response.data : error,
      },
    }));

    return response;
  } catch (error) {
    console.error('Error calling GET MDM endpoints %o', error);
    return null;
  }
};

const getCurrency = (currencyCode) => getAPI(`v1/currencies/${currencyCode}`);
const getACBSIndustrySector = async (industryId) => getAPI(`v1/sector-industries?ukefIndustryId=${industryId}`);
const getACBSCountryCode = async (country) => getAPI(`v1/markets?search=${country}`);

module.exports = {
  getCurrency,
  getACBSIndustrySector,
  getACBSCountryCode,
};
