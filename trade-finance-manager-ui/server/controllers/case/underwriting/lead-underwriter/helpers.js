const CONSTANTS = require('../../../../constants');
const { userIsInTeam } = require('../../../../helpers/user');

const canUserEditLeadUnderwriter = (user) =>
  userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);

module.exports = canUserEditLeadUnderwriter;
