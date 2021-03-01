const api = require('./api');
const tokenFor = require('../temporary-token-handler');

const cleanTeams = async (token) => {
  console.log('cleaning TFM teams');

  for (team of await api.listTeams(token)) {
    await api.deleteTeam(team, token);
  }
};

const cleanUsers = async (token) => {
  console.log('cleaning TFM users');

  for (user of await api.listUsers(token)) {
    await api.deleteUser(user, token);
  }
};

const cleanAllTables = async () => {
  const token = await tokenFor({
    username: 'admin',
    password: 'AbC!2345',
    roles: ['maker', 'editor'],
    bank: { id: '*' },
  });

  await cleanTeams(token);
  await cleanUsers(token);
};

module.exports = cleanAllTables;
