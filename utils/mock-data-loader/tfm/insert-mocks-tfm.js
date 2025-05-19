const api = require('./api');
const MOCKS = require('./mocks');

const insertMocks = async (token) => {
  console.info('Teams');
  const createTeams = Object.values(MOCKS.TEAMS).map((team) => api.createTeam(team));
  await Promise.all(createTeams);

  console.info('Users');
  const createUsers = Object.values(MOCKS.USERS).map((user) => api.createTfmUser(user, token));
  await Promise.all(createUsers);
};

module.exports = insertMocks;
