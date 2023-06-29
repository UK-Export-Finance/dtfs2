const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const { EXTERNAL_API_URL, API_KEY } = process.env;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};
    
const create = async ({
  dealType, entityType, entityId, dealId, user,
}) => {
  let resp;
  try {
    resp = await axios({
      method: 'POST',
      url: `${EXTERNAL_API_URL}/number-generator`,
      headers,
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
