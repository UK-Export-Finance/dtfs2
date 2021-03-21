// const facilityReducer = require('../reducers/facility');
const { findTeamMembers } = require('../../v1/controllers/team.controller');

require('dotenv').config();

const queryTeamMembers = async ({ teamId }) => {
  const teamMembers = await findTeamMembers(teamId);

  const mappedTeamMembers = teamMembers.map((user) => {
    const {
      _id,
      firstName,
      lastName,
    } = user;

    return {
      _id,
      firstName,
      lastName,
    };
  });

  return mappedTeamMembers;
};

module.exports = queryTeamMembers;
