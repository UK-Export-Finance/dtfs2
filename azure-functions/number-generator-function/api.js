const axios = require('axios');

require('dotenv').config();
const { validateEnv } = require('./helpers/validateEnv');

const { MULESOFT_API_UKEF_TF_EA_URL, MULESOFT_API_KEY, MULESOFT_API_SECRET } = validateEnv(process.env);

const getAPI = async (type) => {
  const response = await axios({
    method: 'get',
    url: `${MULESOFT_API_UKEF_TF_EA_URL}/${type}`,
    auth: {
      username: MULESOFT_API_KEY,
      password: MULESOFT_API_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => ({
    status: err.response.status,
  }));

  return response;
};

const postToAPI = async (apiEndpoint, apiData) => {
  console.log('Azure functions - api.postToAPI');
  if (!MULESOFT_API_UKEF_TF_EA_URL) {
    return false;
  }

  const url = `${MULESOFT_API_UKEF_TF_EA_URL}/${apiEndpoint}`;
  console.log('Azure functions - api.postToAPI calling ', url);

  const requestConfig = {
    method: 'post',
    url,
    auth: {
      username: MULESOFT_API_KEY,
      password: MULESOFT_API_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    data: [apiData],
  };
  const response = await axios(requestConfig).catch(
    ({ response: { status, statusText, data } }) => ({
      error: {
        status,
        statusText,
        data,
        requestConfig,
        date: new Date().toISOString(),
      },
    })
  );

  return response;
};

const checkDealId = (dealId) => getAPI(`deal/${dealId}`);
const checkFacilityId = (facilityId) => getAPI(`facility/${facilityId}`);

const callNumberGenerator = (numberType) =>
  postToAPI('numbers', {
    numberTypeId: numberType,
    createdBy: 'Portal v2/TFM',
    requestingSystem: 'Portal v2/TFM',
  });

module.exports = {
  checkDealId,
  checkFacilityId,
  callNumberGenerator,
};
