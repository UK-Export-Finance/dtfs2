const { userIsInTeam } = require('../../helpers/user');

/**
 * Middleware to check if the user is in at least
 * one of the teams specified in the requiredTeams
 * array. If they are not, they are redirected to
 * the redirectUrl, which defaults to '/home' if
 * it is not explicitly provided.
 * @param {import('../../constants/teams').TEAMS[]} requiredTeams - List of required teams
 * @param {string} redirectUrl - Url to redirect to if user does not have a required team
 * @returns {import('express').RequestHandler}
 */
const validateUserTeam = (requiredTeams, redirectUrl = '/home') => (req, res, next) => {
  const { user } = req.session;
  if (userIsInTeam(user, requiredTeams)) {
    return next();
  }
  return res.redirect(redirectUrl);
};

module.exports = validateUserTeam;
