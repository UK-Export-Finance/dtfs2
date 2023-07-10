const axios = require('axios');
require('dotenv').config();

const { TFM_API, TFM_API_KEY } = process.env;

module.exports = async (user) => {
  console.info(`Creating temp user "${user.username}"`);
  await axios({
    method: 'post',
    TFM_API: `${TFM_API}/v1/user`,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': TFM_API_KEY,
    },
    data: user,
  }).catch((err) => {
    console.error(`failed to create temp user ${JSON.stringify(err)}`);
  });

  console.info(`Logging in as "${user.username}"`);
  const { data } = await axios({
    method: 'post',
    TFM_API: `${TFM_API}/v1/login`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: { username: user.username, password: user.password },
  });

  const { token } = data;
  return token;
};
