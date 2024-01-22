exports.userFullName = (user) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

/**
 * Function to return whether or not a user is in
 * any of the teams provided
 * @param {import('server/types/tfm-session-user').TfmSessionUser} user - The user object
 * @param {import('../types/team-id').TeamId[]} teamIdList - List of team ids to check
 * @returns {boolean}
 */
exports.userIsInTeam = (user, teamIdList) => user.teams.some((teamId) => teamIdList.includes(teamId));

/**
 * Function to return whether or not a user is in
 * only the set of teams provided
 * @param {import('server/types/tfm-session-user').TfmSessionUser} user - The session user
 * @param {import('../types/team-id').TeamId[]} teamIdList - List of required team ids
 * @returns {boolean}
 */
exports.userIsOnlyInTeam = (user, teamIdList) => user.teams.length === teamIdList.length && user.teams.every((userTeam) => teamIdList.includes(userTeam));

exports.isAssignedToUser = (assignedToUserId, userId) => assignedToUserId === userId;
