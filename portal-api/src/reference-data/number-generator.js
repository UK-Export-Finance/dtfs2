const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

const create = async ({
  dealType, entityType, entityId, dealId, user,
}) => {
  let resp;
  try {
    resp = await axios({
      method: 'POST',
      url: `${referenceProxyUrl}/number-generator`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dealType, entityType, entityId, dealId, user,
      },
    }).catch((err) => {
      throw new Error(err.response);
    });
  } catch (err) {
    throw new Error(err);
  }

  const { data } = resp;

  return data;
};

module.exports = {
  create,
};
