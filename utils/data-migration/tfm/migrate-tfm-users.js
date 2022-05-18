/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const api = require('../../mock-data-loader/tfm/api');
const tokenFor = require('../../mock-data-loader/temporary-token-handler');
const USERS = require('./users_with_passwords.json');
const TEAMS = require('./tfm-teams');

const insertTfmUsersAndTeams = async () => {
  const token = await tokenFor({
    username: 're-insert-mocks',
    password: 'AbC!2345',
    firstname: 'Mock',
    surname: 'DataLoader',
    roles: ['data-admin'],
    email: 're-insert-mocks-tfm',
  });

  console.info('Cleaning TFM teams');
  for (const team of await api.listTeams(token)) {
    await api.deleteTeam(team, token);
  }

  console.info('Cleaning TFM users');
  for (const user of await api.listUsers(token)) {
    await api.deleteUser(user, token);
  }

  console.info('inserting TFM teams');
  for (const team of TEAMS) {
    await api.createTeam(team, token);
  }

  console.info('inserting TFM users');
  for (const user of USERS) {
    await api.createTfmUser(user);
  }
  console.info('Users inserted');
};

insertTfmUsersAndTeams();
