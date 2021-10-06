const CONSTANTS = require('../../../constants');
const { userIsInTeam } = require('../../../helpers/user');

const userCanEdit = (user) => userIsInTeam(user, [CONSTANTS.TEAMS.BUSINESS_SUPPORT]);

module.exports = userCanEdit;
