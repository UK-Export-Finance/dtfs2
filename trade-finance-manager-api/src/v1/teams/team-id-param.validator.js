const { param } = require('express-validator');
const { ALL_VALID_TEAM_IDS } = require('../../constants');

const teamIdParamValidator = () => param('teamId')
  .isIn(ALL_VALID_TEAM_IDS)
  .withMessage(`teamId must be one of ${ALL_VALID_TEAM_IDS.join(', ')}`);

module.exports = {
  teamIdParamValidator
};
