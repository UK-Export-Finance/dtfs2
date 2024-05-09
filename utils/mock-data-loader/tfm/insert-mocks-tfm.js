const { logger } = require('../helpers/logger.helper');
const api = require('./api');
const MOCKS = require('./mocks');

const insertMocks = async (token) => {
  logger.info('inserting TFM mocks');
  logger.info('inserting TFM teams', { depth: 1 });
  const createTeams = Object.values(MOCKS.TEAMS).map((team) => api.createTeam(team));
  await Promise.all(createTeams);

  logger.info('inserting TFM users', { depth: 1 });
  const createUsers = Object.values(MOCKS.USERS).map((user) => api.createTfmUser(user, token));
  await Promise.all(createUsers);
};

module.exports = insertMocks;
