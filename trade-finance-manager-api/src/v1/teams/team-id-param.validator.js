const { param } = require('express-validator');
const { getAllValidTeamIds } = require('./teams');

const allTeamIds = getAllValidTeamIds();

const teamIdParamValidator = () => param('teamId')
  .isIn(allTeamIds)
  .withMessage(`teamId must be one of ${allTeamIds.join(', ')}`);

module.exports = {
  teamIdParamValidator
};
