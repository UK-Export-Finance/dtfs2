const api = require('../api');

const findTeamMembers = async (teamId) => {
  const teamMembers = await api.findTeamMembers(teamId);
  return teamMembers;
};

exports.findTeamMembers = findTeamMembers;
