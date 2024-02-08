const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': EXTERNAL_API_KEY,
};

const create = async ({ dealType, entityType, entityId, dealId, user }) => {
  let response;
  try {
    response = await axios({
      method: 'POST',
      url: `${EXTERNAL_API_URL}/number-generator`,
      headers,
      data: {
        dealType,
        entityType,
        entityId,
        dealId,
        user,
      },
    }).catch((error) => {
      throw new Error(error.response);
    });
  } catch (error) {
    console.error('Error getting number for deal %O', dealId);
    throw new Error('Error getting number for deal');
  }

  const { data } = response;

  return data;
};

module.exports = {
  create,
};
