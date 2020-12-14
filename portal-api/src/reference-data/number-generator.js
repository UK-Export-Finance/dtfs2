const axios = require('axios');

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

const create = async (numberType) => {
  const { status, data } = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/number-generator/${numberType}`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => err);

  return {
    status,
    data,
  };
};

module.exports = {
  create,
};
