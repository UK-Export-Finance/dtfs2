const { TEAM_IDS } = require('../../constants');

/**
 * Sets the res.locals.userIsInPdcTeam variable
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response}} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const isUserInPdcTeam = (req, res, next) => {
  const { user } = req.session;
  if (!user) {
    res.locals.userIsInPdcTeam = false;
    return next();
  }

  const pdcTeamIds = [TEAM_IDS.PDC_READ, TEAM_IDS.PDC_RECONCILE];
  res.locals.userIsInPdcTeam = user.teams.some(({ id }) => pdcTeamIds.includes(id));
  return next();
};

module.exports = isUserInPdcTeam;
