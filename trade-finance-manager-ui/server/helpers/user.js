exports.userFullName = (user) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

/**
 * Function to return whether or not a user is in one
 * of any of the teams provided in teamList
 * @param {object} user - The user object
 * @param {import('../../server/constants/teams').TEAMS[]} teamList - List of teams to check
 * @returns {boolean}
 */
exports.userIsInTeam = (user, teamList) =>
  teamList.some((teamId) => user.teams.some((team) => team.id === teamId));

exports.isAssignedToUser = (assignedToUserId, userId) => (assignedToUserId === userId);
