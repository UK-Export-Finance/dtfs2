const CONSTANTS = require('../../../../constants');
const { userIsInTeam } = require('../../../../helpers/user');

const userCanEditGeneral = (user) => userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITERS, CONSTANTS.TEAMS.UNDERWRITER_MANAGERS, CONSTANTS.TEAMS.RISK_MANAGERS]);

module.exports = { userCanEditGeneral };
