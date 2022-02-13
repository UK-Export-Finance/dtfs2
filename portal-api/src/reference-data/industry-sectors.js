const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

const getIndustrySectors = async () => {
  const { status, data } = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/industry-sectors`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => err);

  return {
    status,
    industrySectors: data.industrySectors,
  };
};

const getIndustrySector = async (id) => {
  const { status, data } = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/industry-sectors/${id}`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => err);

  return { status, data };
};

module.exports = {
  getIndustrySectors,
  getIndustrySector,
};
