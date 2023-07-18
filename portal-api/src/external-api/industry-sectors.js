const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': EXTERNAL_API_KEY,
};

const getIndustrySectors = async () => {
  const { status, data } = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/industry-sectors`,
    headers,
  }).catch((error) => {
    console.error('Error retrieving industry sectors from External API. ', error);
    return error;
  });

  return {
    status,
    industrySectors: data.industrySectors,
  };
};

const getIndustrySector = async (id) => {
  const { status, data } = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/industry-sectors/${id}`,
    headers,
  }).catch((error) => {
    console.error('Error retrieving industry sector from External API. ', error);
    return error;
  });

  return { status, data };
};

module.exports = {
  getIndustrySectors,
  getIndustrySector,
};
