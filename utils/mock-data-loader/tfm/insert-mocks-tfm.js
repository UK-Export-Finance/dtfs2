const api = require('./api');
const MOCKS = require('./mocks');

const tokenFor = require('../temporary-token-handler');

const insertMocks = async () => {
  const token = await tokenFor({
    username: 're-insert-mocks',
    password: 'AbC!2345',
    firstname: 'Mock',
    surname: 'DataLoader',
    roles: ['data-admin'],
    email: 're-insert-mocks-data-loader-tfm',
  });

  console.info('inserting TFM teams');
  MOCKS.TEAMS.forEach((team) => api.createTeam(team, token));

  console.info('inserting TFM users');

  MOCKS.USERS.forEach((user) => api.createTfmUser(user));
};

module.exports = insertMocks;
