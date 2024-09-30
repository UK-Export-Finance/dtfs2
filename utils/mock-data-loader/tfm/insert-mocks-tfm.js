const api = require('./api');
const MOCKS = require('./mocks');

const insertMocks = async (token) => {
  console.info('inserting TFM mocks');
  console.info('inserting TFM teams');
  const createTeams = Object.values(MOCKS.TEAMS).map((team) => api.createTeam(team));
  await Promise.all(createTeams);

  console.info('inserting TFM users');
  const createUsers = Object.values(MOCKS.USERS).map((user) => api.createTfmUser(user, token));
  await Promise.all(createUsers);
};

module.exports = insertMocks;
