const userFullName = (user) => {
  const { firstName, lastName } = user;
  return `${firstName} ${lastName}`;
};

const userIsInTeam = (user, teamId) =>
  user.teams.includes(teamId);

export default {
  userFullName,
  userIsInTeam,
};
