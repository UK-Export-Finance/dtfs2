const { param } = require('express-validator');
const { TEAM_IDS } = require('../../constants');

const teamIdParamValidator = () =>
  param('teamId')
    .isIn(TEAM_IDS)
    .withMessage(`teamId must be one of ${TEAM_IDS.join(', ')}`);

module.exports = {
  teamIdParamValidator,
};
