const CONSTANTS = require('../../../../constants');
const { userIsInTeam } = require('../../../../helpers/user');

const userCanEditLeadUnderwriter = (user) =>
  userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);

module.exports = userCanEditLeadUnderwriter;
