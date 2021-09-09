const axios = require('axios');

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

const create = async (entityType) => {
  const { data } = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/number-generator/${entityType}`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => err);

  return data.id;
};

module.exports = {
  create,
};
