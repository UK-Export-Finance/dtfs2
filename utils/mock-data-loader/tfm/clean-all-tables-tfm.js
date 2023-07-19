const api = require('./api');

const cleanTeams = async () => {
  console.info('cleaning TFM teams');

  for (const team of await api.listTeams()) {
    await api.deleteTeam(team);
  }
};

const cleanUsers = async () => {
  console.info('cleaning TFM users');

  for (const user of await api.listUsers()) {
    if (user.username !== 're-insert-mocks') {
      await api.deleteUser(user);
    }
  }
};

const cleanTfmDeals = async () => {
  console.info('cleaning TFM deals and facilities');

  const tfmDeals = await api.listDeals();

  if (tfmDeals) {
    for (const deal of tfmDeals) {
      await api.deleteDeal(deal);
    }
  }
};

const cleanAllTables = async () => {
  await cleanTeams();
  await cleanUsers();
  await cleanTfmDeals();
};

module.exports = cleanAllTables;
