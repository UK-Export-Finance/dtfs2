const TEAMS = require('../constants/teams');

const allValidTeamIds = () => Object.values(TEAMS);

module.exports = {
  allValidTeamIds,
};
