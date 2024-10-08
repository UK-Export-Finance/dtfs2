const { logger } = require('../helpers/logger.helper');
const { mongoDbClient } = require('../database/database-client');
const api = require('./api');

const cleanTeams = async () => {
  logger.info('cleaning TFM teams', { depth: 1 });

  for (const team of await api.listTeams()) {
    await api.deleteTeam(team);
  }
};

const cleanUsers = async () => {
  logger.info('cleaning TFM users', { depth: 1 });

  for (const user of await api.listUsers()) {
    if (user.username !== 're-insert-mocks') {
      await api.deleteUser(user);
    }
  }
};

const cleanTfmDeals = async () => {
  logger.info('cleaning TFM deals', { depth: 1 });

  const tfmDeals = await api.listDeals();

  if (tfmDeals) {
    for (const deal of tfmDeals) {
      await api.deleteDeal(deal);
    }
  }
};

const cleanTfmFacilities = async () => {
  logger.info('cleaning TFM facilities', { depth: 1 });

  const tfmFacilitiesCollection = await mongoDbClient.getCollection('tfm-facilities');
  await tfmFacilitiesCollection.deleteMany({});
};

const cleanAllTables = async () => {
  logger.info('cleaning TFM tables');
  await cleanTeams();
  await cleanUsers();
  await cleanTfmDeals();
  await cleanTfmFacilities();
};

module.exports = cleanAllTables;
