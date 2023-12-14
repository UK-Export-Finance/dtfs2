exports.userFullName = (user) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

exports.userIsInTeam = (user, teamList) => teamList.some((teamId) => user.teams.includes(teamId));

exports.isAssignedToUser = (assignedToUserId, userId) => assignedToUserId === userId;
