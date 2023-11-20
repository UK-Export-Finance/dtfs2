const userIsInOneRequiredTeam = (user, requiredTeams) => requiredTeams.some((team) => team.id === user.team.id);

const validateUserTeam = (requiredTeams, redirectUrl = '/deals') => (req, res, next) => {
  const { user } = req.session;
  if (userIsInOneRequiredTeam(user, requiredTeams)) {
    next();
  }
  res.redirect(redirectUrl);
};

module.exports = validateUserTeam;
