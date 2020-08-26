const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;

module.exports = async (user) => {
  console.log(`Creating temp user ${user}`)
  await axios({
    method: 'post',
    url: `${urlRoot}/v1/users`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: user,
  }).catch(err => {
    console.log(`failed to create temp user`);
    console.log(`${JSON.stringify(err)}`);
  });

  console.log(`Logging in as ${user}`)
  const { data } = await axios({
    method: 'post',
    url: `${urlRoot}/v1/login`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: { username: user.username, password: user.password },
  });

  const { token } = data;
  console.log(`Got a token ${token}`)
  return token;
};
