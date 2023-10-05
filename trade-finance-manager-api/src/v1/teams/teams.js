const TEAMS = require('../../constants/teams');

const allValidTeamIds = () => Object.values(TEAMS).map(({ id }) => id);

module.exports = {
  allValidTeamIds,
};
