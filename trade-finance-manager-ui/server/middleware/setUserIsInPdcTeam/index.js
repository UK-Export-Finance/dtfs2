const { userIsInTeam } = require('../../helpers/user');
const { PDC_TEAM_IDS } = require('../../constants');

/**
 * Sets the res.locals.userIsInPdcTeam variable
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const setUserIsInPdcTeam = (req, res, next) => {
  const { user } = req.session;
  if (!user) {
    res.locals.userIsInPdcTeam = false;
    return next();
  }

  res.locals.userIsInPdcTeam = userIsInTeam(user, Object.values(PDC_TEAM_IDS));
  return next();
};

module.exports = setUserIsInPdcTeam;
