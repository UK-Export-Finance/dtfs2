const { TEAM_IDS } = require('@ukef/dtfs2-common');
const { userIsInTeam } = require('../../../../helpers/user');

const userCanEditGeneral = (user) => userIsInTeam(user, [TEAM_IDS.UNDERWRITERS, TEAM_IDS.UNDERWRITER_MANAGERS, TEAM_IDS.RISK_MANAGERS]);

module.exports = { userCanEditGeneral };
