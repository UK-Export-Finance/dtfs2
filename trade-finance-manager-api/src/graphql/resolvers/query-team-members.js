const { findTeamMembers } = require('../../v1/controllers/team.controller');
const teamMembersReducer = require('../reducers/teamMembers');

require('dotenv').config();

const queryTeamMembers = async ({ teamId }) => {
  const teamMembers = await findTeamMembers(teamId);

  return teamMembersReducer(teamMembers);
};

module.exports = queryTeamMembers;
