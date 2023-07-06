const api = require('./api');

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

const cleanAllTables = async (token) => {
  await cleanTeams(token);
  await cleanUsers(token);
  await cleanTfmDeals(token);
};

module.exports = cleanAllTables;
