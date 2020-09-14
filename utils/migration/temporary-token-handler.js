const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;

let migrationUserId;

const migrationUserFields = {
  username: 'data-migration',
  password: 'AbC!2345',
  firstname: 'migration',
  surname: 'DataLoader',
  roles: ['maker', 'editor', 'data-admin'],
  bank: {
    id: '9',
  },
};

module.exports.removeMigrationUser = async () => {
  await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/v1/users/${migrationUserId}`,
  }).catch((err) => { console.log(`err: ${err}`); });
};

module.exports.getToken = async () => {
  console.log(`Creating temp user ${migrationUserFields.username}`);

  const { data: { user } } = await axios({
    method: 'post',
    url: `${urlRoot}/v1/users`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: migrationUserFields,
  }).catch((err) => {
    console.log('failed to create temp user');
    console.log(`${JSON.stringify(err)}`);
  });

  migrationUserId = user._id;

  const { data } = await axios({
    method: 'post',
    url: `${urlRoot}/v1/login`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: { username: migrationUserFields.username, password: migrationUserFields.password },
  });

  const { token } = data;
  console.log(`Got a token ${token}`);
  return token;
};
