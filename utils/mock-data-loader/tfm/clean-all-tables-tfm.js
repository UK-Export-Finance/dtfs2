const { mongoDbClient } = require('../../drivers/db-client');
const api = require('./api');

const cleanTeams = async () => {
  console.info('Teams');

  for (const team of await api.listTeams()) {
    await api.deleteTeam(team);
  }
};

const cleanUsers = async () => {
  console.info('Users');

  for (const user of await api.listUsers()) {
    if (user.username !== 're-insert-mocks') {
      await api.deleteUser(user);
    }
  }
};

const cleanTfmDeals = async () => {
  console.info('Deals');

  const tfmDeals = await api.listDeals();

  if (tfmDeals) {
    for (const deal of tfmDeals) {
      await api.deleteDeal(deal);
    }
  }
};

const cleanTfmFacilities = async () => {
  console.info('Facilities');

  const tfmFacilitiesCollection = await mongoDbClient.getCollection('tfm-facilities');
  await tfmFacilitiesCollection.deleteMany({});
};

const cleanAllTables = async () => {
  await cleanTeams();
  await cleanUsers();
  await cleanTfmDeals();
  await cleanTfmFacilities();
};

module.exports = cleanAllTables;
