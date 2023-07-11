const axios = require('axios');
require('dotenv').config();

const { PORTAL_API_URL, PORTAL_API_KEY } = process.env;

module.exports = async (user) => {
  console.info(`Creating temp user "${user.username}"`);
  await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/users`,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': PORTAL_API_KEY,
    },
    data: user,
  }).catch((err) => {
    console.error(`failed to create temp user ${JSON.stringify(err)}`);
  });

  console.info(`Logging in as "${user.username}"`);
  const { data } = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/login`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: { username: user.username, password: user.password },
  });

  const { token } = data;
  return token;
};
