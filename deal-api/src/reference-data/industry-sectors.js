
const axios = require('axios');

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

const getIndustrySectors = async () => {
  console.log(`getIndustrySectors: ${referenceProxyUrl}/industry-sectors`);
  const { status, data } = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/industry-sectors`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => err);

  console.log('getIndustrySectors', { status, data });

  return {
    status,
    industrySectors: data.industrySectors,
  };
};

const getIndustrySector = async (id) => {
  console.log(`getIndustrySector: ${referenceProxyUrl}/industry-sectors/${id}`);
  const { status, data } = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/industry-sectors/${id}`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => err);
  console.log(`getIndustrySector: ${id}`, { status, data });

  return { status, data };
};

module.exports = {
  getIndustrySectors,
  getIndustrySector,
};
