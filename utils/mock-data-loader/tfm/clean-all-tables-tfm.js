const api = require('./api');
const tokenFor = require('../temporary-token-handler');

const cleanTeams = async (token) => {
  console.info('cleaning TFM teams');

  for (const team of await api.listTeams(token)) {
    await api.deleteTeam(team, token);
  }
};

const cleanUsers = async (token) => {
  console.info('cleaning TFM users');

  for (const user of await api.listUsers(token)) {
    await api.deleteUser(user, token);
  }
};

const cleanTfmDeals = async (token) => {
  console.info('cleaning TFM deals and facilities');

  const tfmDeals = await api.listDeals(token);

  if (tfmDeals) {
    for (const deal of tfmDeals) {
      await api.deleteDeal(deal, token);
    }
  }
};

const cleanAllTables = async () => {
  const token = await tokenFor({
    username: 'admin',
    email: 'admin-4',
    password: 'AbC!2345',
    roles: ['maker', 'editor'],
    bank: { id: '*' },
  });

  await cleanTeams(token);
  await cleanUsers(token);
  await cleanTfmDeals(token);
};

module.exports = cleanAllTables;
