const api = require('./api');
const MOCKS = require('./mocks');

const insertMocks = async (token) => {
  console.info('inserting TFM teams');
  const createTeams = Object.values(MOCKS.TEAMS).map((team) => api.createTeam(team, token));
  await Promise.all(createTeams);

  console.info('inserting TFM users');
  const createUsers = MOCKS.USERS.map((user) => api.createTfmUser(user, token));
  await Promise.all(createUsers);
};

module.exports = insertMocks;
