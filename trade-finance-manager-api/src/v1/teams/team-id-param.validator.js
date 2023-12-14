const { param } = require('express-validator');
const { allValidTeamIds } = require('./teams');

const allTeamIds = allValidTeamIds();

const teamIdParamValidator = () =>
  param('teamId')
    .isIn(allTeamIds)
    .withMessage(`teamId must be one of ${allTeamIds.join(', ')}`);

module.exports = {
  teamIdParamValidator,
};
