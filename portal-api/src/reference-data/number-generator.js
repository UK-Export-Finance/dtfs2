const axios = require('axios');

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

console.log({ referenceProxyUrl });
const create = async ({
  dealType, entityType, entityId, dealId, user,
}) => {
  const { data } = await axios({
    method: 'POST',
    url: `${referenceProxyUrl}/number-generator/`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      dealType, entityType, entityId, dealId, user,
    },
  }).catch((err) => err.response);

  return data;
};

module.exports = {
  create,
};
