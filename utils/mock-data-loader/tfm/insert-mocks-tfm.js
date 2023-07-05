const api = require('./api');
const MOCKS = require('./mocks');

const tokenFor = require('../temporary-token-handler-tfm');

const insertMocks = async () => {
  const token = await tokenFor({
    username: 're-insert-mocks',
    password: 'AbC!2345',
    firstname: 'Mock',
    surname: 'DataLoader',
    roles: ['data-admin'],
    email: 're-insert-mocks-data-loader-tfm@ukexportfinance.gov.uk',
  });

  console.info('inserting TFM teams');
  for (const team of MOCKS.TEAMS) {
    await api.createTeam(team, token);
  }

  console.info('inserting TFM users');
  for (const user of MOCKS.USERS) {
    await api.createTfmUser(user, token);
  }
};

module.exports = insertMocks;
