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
  });

  console.log('inserting TFM teams');
  for (team of MOCKS.TEAMS) {
    await api.createTeam(team, token);
  }

  console.log('inserting TFM users');
  for (user of MOCKS.USERS) {
    await api.createUser(user, token);
  }
};

module.exports = insertMocks;
