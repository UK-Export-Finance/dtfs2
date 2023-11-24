const CONSTANTS = require('../../../../constants');
const { userIsInTeam } = require('../../../../helpers/user');

const userCanEditGeneral = (user) =>
  userIsInTeam(user, [CONSTANTS.TEAM_IDS.UNDERWRITERS, CONSTANTS.TEAM_IDS.UNDERWRITER_MANAGERS, CONSTANTS.TEAM_IDS.RISK_MANAGERS]);

module.exports = { userCanEditGeneral };
