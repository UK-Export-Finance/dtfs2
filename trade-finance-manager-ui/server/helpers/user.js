exports.userFullName = (user) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

/**
 * Function to return whether or not a user is in one
 * of any of the teams provided in teamList
 * @param {object} user - The user object
 * @param {import('../constants/teamIds').TEAM_IDS[]} teamIdList - List of team ids to check
 * @returns {boolean}
 */
exports.userIsInTeam = (user, teamIdList) =>
  teamIdList.some((teamId) => user.teams.some((team) => team.id === teamId));

exports.isAssignedToUser = (assignedToUserId, userId) => (assignedToUserId === userId);
