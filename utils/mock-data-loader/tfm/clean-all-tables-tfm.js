const { mongoDbClient } = require('../database/database-client');
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
  console.info('cleaning TFM deals');

  const tfmDeals = await api.listDeals();

  if (tfmDeals) {
    for (const deal of tfmDeals) {
      await api.deleteDeal(deal);
    }
  }
};

const cleanTfmFacilities = async () => {
  console.info('cleaning TFM facilities');

  const tfmFacilitiesCollection = await mongoDbClient.getCollection('tfm-facilities');
  await tfmFacilitiesCollection.deleteMany({});
};

const cleanAllTables = async () => {
  console.info('cleaning TFM tables');
  await cleanTeams();
  await cleanUsers();
  await cleanTfmDeals();
  await cleanTfmFacilities();
};

module.exports = cleanAllTables;
