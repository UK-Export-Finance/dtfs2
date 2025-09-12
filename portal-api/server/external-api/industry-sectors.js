const axios = require('axios');
const dotenv = require('dotenv');
const { HEADERS } = require('@ukef/dtfs2-common');
const { isValidRegex } = require('../v1/validation/validateIds');
const { INDUSTRY_SECTOR_ID } = require('../constants/regex');

dotenv.config();

const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;

const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  'x-api-key': String(EXTERNAL_API_KEY),
};

const getIndustrySectors = async () => {
  const { status, data } = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/industry-sectors`,
    headers,
  }).catch((error) => {
    console.error('Error retrieving industry sectors from External API. %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to get industry sectors' };
  });

  return {
    status,
    industrySectors: data.industrySectors,
  };
};

const getIndustrySector = async (id) => {
  if (!isValidRegex(INDUSTRY_SECTOR_ID, id)) {
    console.error('industry-sectors.getIndustrySector: invalid id provided %s', id);
    return { status: 400 };
  }
  const { status, data } = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/industry-sectors/${id}`,
    headers,
  }).catch((error) => {
    console.error('Error retrieving industry sector from External API. %o', error);
    return { status: 404, error };
  });

  return { status, data };
};

module.exports = {
  getIndustrySectors,
  getIndustrySector,
};
