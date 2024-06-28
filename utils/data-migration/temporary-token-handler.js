const axios = require('axios');
const { HEADERS } = require('@ukef/dtfs2-common');
require('dotenv').config();
const {
  ROLES: { MAKER, ADMIN },
} = require('./constant');

const urlRoot = process.env.PORTAL_API_URL;
const { PORTAL_API_KEY } = process.env;

const headers = {
  'x-api-key': PORTAL_API_KEY,
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
};

let migrationUserId;

const migrationUserFields = {
  username: 'data-migration',
  password: 'AbC!2345',
  firstname: 'V1 Migration',
  surname: 'DataLoader',
  email: 'data-migration',
  roles: [MAKER, ADMIN],
  bank: {
    id: '*',
  },
};

module.exports.removeMigrationUser = async (token) => {
  console.info(`Removing temp migration user ${migrationUserFields.username}`);
  await axios({
    method: 'delete',
    headers: {
      ...headers,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${urlRoot}/v1/users/${migrationUserId}`,
  }).catch((error) => {
    console.error(`Error removing migration user ${error}`);
  });
};

module.exports.getToken = async () => {
  console.info(`Creating temp migration user ${migrationUserFields.username}`);

  const {
    data: { user },
  } = await axios({
    method: 'post',
    url: `${urlRoot}/v1/user`,
    headers,
    data: migrationUserFields,
  }).catch((error) => {
    console.error(`Failed to create temp user ${JSON.stringify(error)}`);
  });

  migrationUserId = user._id;

  const { data } = await axios({
    method: 'post',
    url: `${urlRoot}/v1/login`,
    headers,
    data: { username: migrationUserFields.username, password: migrationUserFields.password },
  });

  const { token } = data;
  console.info('Temp migration user ready');
  return token;
};
