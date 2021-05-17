export const userFullName = (user) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

export const userIsInTeam = (user, teamList) =>
  teamList.some((teamId) => user.teams.includes(teamId));
