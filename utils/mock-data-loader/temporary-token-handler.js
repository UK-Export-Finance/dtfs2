const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;

module.exports = async (user) => {
  console.info(`Creating temp user "${user.username}"`);
  await axios({
    method: 'post',
    url: `${urlRoot}/v1/users`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: user,
  }).catch((err) => {
    console.info('failed to create temp user');
    console.info(`${JSON.stringify(err)}`);
  });

  console.info(`Logging in as "${user.username}"`);
  const { data } = await axios({
    method: 'post',
    url: `${urlRoot}/v1/login`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: { username: user.username, password: user.password },
  });

  const { token } = data;
  return token;
};
