const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;

const migrationUser = {
  username: 'data-migration',
  password: 'AbC!2345',
  firstname: 'migration',
  surname: 'DataLoader',
  roles: ['maker', 'editor', 'data-admin'],
  bank: {
    id: '9',
  },
};

module.exports.getToken = async (user = migrationUser) => {
  console.log(`Creating temp user ${user.username}`);

  await axios({
    method: 'post',
    url: `${urlRoot}/v1/users`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: user,
  }).catch((err) => {
    console.log('failed to create temp user');
    console.log(`${JSON.stringify(err)}`);
  });

  const { data } = await axios({
    method: 'post',
    url: `${urlRoot}/v1/login`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: { username: user.username, password: user.password },
  });

  const { token } = data;
  console.log(`Got a token ${token}`);
  return token;
};
