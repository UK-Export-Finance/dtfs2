export const userFullName = (user) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

export const userIsInTeam = (user, teamList) =>
  teamList.some((teamId) => user.teams.includes(teamId));


export const isAssignedToUser = (assignedToUserId, userId) => {
  if (assignedToUserId === userId) {
    return true;
  }

  return false;
};
