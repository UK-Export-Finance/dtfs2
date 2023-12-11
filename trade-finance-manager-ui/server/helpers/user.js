exports.userFullName = (user) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

/**
 * Function to return whether or not a user is in
 * any of the teams provided in teamIdList
 * @param {object} user - The user object
 * @param {import('../types/team-id').TeamId[]} teamIdList - List of team ids to check
 * @returns {boolean}
 */
exports.userIsInTeam = (user, teamIdList) => user.teams.some((teamId) => teamIdList.includes(teamId));

exports.isAssignedToUser = (assignedToUserId, userId) => assignedToUserId === userId;
