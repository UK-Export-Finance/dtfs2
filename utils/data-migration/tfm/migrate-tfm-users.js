const { mongoDbClient } = require('../../mock-data-loader/database/database-client');
const { TEAMS, USERS } = require('../../mock-data-loader/tfm-mocks');
const { mapMockTfmUserToTfmUser } = require('../../mock-data-loader/insert-tfm-mocks');

const insertTfmUsersAndTeams = async () => {
  console.info('Cleaning TFM teams');
  const tfmTeamsCollection = await mongoDbClient.getCollection('tfm-teams');
  await tfmTeamsCollection.deleteMany({});

  console.info('Cleaning TFM users');
  const tfmUsersCollection = await mongoDbClient.getCollection('tfm-users');
  await tfmUsersCollection.deleteMany({});

  console.info('inserting TFM teams');
  await tfmTeamsCollection.insertMany(Object.values(TEAMS));

  console.info('inserting TFM users');
  await tfmUsersCollection.insertMany(Object.values(USERS).map(mapMockTfmUserToTfmUser));

  console.info('Users inserted');
};

insertTfmUsersAndTeams();
