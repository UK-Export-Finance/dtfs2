const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;

let migrationUserId;

const migrationUserFields = {
  username: 'data-migration',
  password: 'AbC!2345',
  firstname: 'V1 Migration',
  surname: 'DataLoader',
  roles: ['maker', 'editor', 'data-admin'],
  bank: {
    id: '*',
  },
};

module.exports.removeMigrationUser = async () => {
  console.info(`remove temp user ${migrationUserFields.username}`);
  await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/v1/users/${migrationUserId}`,
  }).catch((err) => { console.info(`err: ${err}`); });
};

module.exports.getToken = async () => {
  console.info(`Creating temp user ${migrationUserFields.username}`);

  const { data: { user } } = await axios({
    method: 'post',
    url: `${urlRoot}/v1/users`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: migrationUserFields,
  }).catch((err) => {
    console.info('failed to create temp user');
    console.info(`${JSON.stringify(err)}`);
  });

  console.log('------ user \n', user);

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
  console.info('Got a token');
  return token;
};
