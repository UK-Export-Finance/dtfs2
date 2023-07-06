const api = require('./api');
const MOCKS = require('./mocks');

const insertMocks = async (token) => {
  console.info('inserting TFM teams');
  for (const team of MOCKS.TEAMS) {
    await api.createTeam(team, token);
  }

  console.info('inserting TFM users');
  for (const user of MOCKS.USERS) {
    await api.createTfmUser(user);
  }
};

module.exports = insertMocks;
