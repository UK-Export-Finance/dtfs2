const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;
const { PORTAL_API_KEY } = process.env;

let migrationUserId;

const migrationUserFields = {
  username: 'data-migration',
  password: 'AbC!2345',
  firstname: 'V1 Migration',
  surname: 'DataLoader',
  email: 'data-migration',
  roles: ['maker', 'editor', 'data-admin'],
  bank: {
    id: '*',
  },
};

module.exports.removeMigrationUser = async (token) => {
  console.info(`Removing temp migration user ${migrationUserFields.username}`);
  await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/users/${migrationUserId}`,
  }).catch((err) => { console.error(`Error removing migration user ${err}`); });
};

module.exports.getToken = async () => {
  console.info(`Creating temp migration user ${migrationUserFields.username}`);

  const { data: { user } } = await axios({
    method: 'post',
    url: `${urlRoot}/v1/user`,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': PORTAL_API_KEY,
    },
    data: migrationUserFields,
  }).catch((err) => {
    console.error(`Failed to create temp user ${JSON.stringify(err)}`);
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
  console.info('Temp migration user ready');
  return token;
};
