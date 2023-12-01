const TEAMS = require('../../constants/teams');

/**
 * Returns an array of all valid teams ids from the
 * TEAMS object defined in the constants directory
 * @returns {import('../../types/teamIds').TeamId[]}
 */
const allValidTeamIds = () => Object.values(TEAMS).map(({ id }) => id);

module.exports = {
  allValidTeamIds,
};
