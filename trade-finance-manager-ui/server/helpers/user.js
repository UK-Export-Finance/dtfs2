export const userFullName = (user) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

export const userIsInTeam = (user, teamId) =>
  user.teams.includes(teamId);
