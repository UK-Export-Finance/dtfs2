const axios = require('axios');

const postToAPI = async (apiEndpoint, apiData) => {
  if (!process.env.MULESOFT_API_UKEF_ESTORE_EA_URL) {
    return false;
  }

  const response = await axios({
    method: 'post',
    url: `${process.env.MULESOFT_API_UKEF_ESTORE_EA_URL}/${apiEndpoint}`,
    auth: {
      username: process.env.MULESOFT_API_UKEF_ESTORE_EA_KEY,
      password: process.env.MULESOFT_API_UKEF_ESTORE_EA_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    data: [apiData],
  }).catch((catchErr) => {
    console.error('Error calling eStore API',
      {
        url: `${process.env.MULESOFT_API_UKEF_ESTORE_EA_URL}/${apiEndpoint}`,
        data: [apiData],
        response: catchErr.response,
      });
    return catchErr.response;
  });
  return response;
};

const createExporterSite = (exporterName) => postToAPI('site', { exporterName });
const createBuyerFolder = ({ siteName, ...apiData }) => postToAPI(`site/${siteName}/buyer`, apiData);
const createDealFolder = ({ siteName, ...apiData }) => postToAPI(`site/${siteName}/deal`, apiData);
const createFacilityFolder = ({ siteName, dealIdentifier, ...apiData }) => postToAPI(`site/${siteName}/deal/${dealIdentifier}/facility`, apiData);

module.exports = {
  createExporterSite,
  createBuyerFolder,
  createDealFolder,
  createFacilityFolder,
};
