const { logger } = require('../helpers/logger.helper');
const api = require('./api');

const cleanTeams = async () => {
  logger({ message: 'cleaning TFM teams', depth: 1 });

  for (const team of await api.listTeams()) {
    await api.deleteTeam(team);
  }
};

const cleanUsers = async () => {
  logger({ message: 'cleaning TFM users', depth: 1 });

  for (const user of await api.listUsers()) {
    if (user.username !== 're-insert-mocks') {
      await api.deleteUser(user);
    }
  }
};

const cleanTfmDeals = async () => {
  logger({ message: 'cleaning TFM deals and facilities', depth: 1 });

  const tfmDeals = await api.listDeals();

  if (tfmDeals) {
    for (const deal of tfmDeals) {
      await api.deleteDeal(deal);
    }
  }
};

const cleanAllTables = async () => {
  logger({ message: 'cleaning TFM tables' });
  await cleanTeams();
  await cleanUsers();
  await cleanTfmDeals();
};

module.exports = cleanAllTables;
