const { userIsInTeam } = require('../../helpers/user');

/**
 * Middleware to check if the user is in at least
 * one of the teams specified in the requiredTeamIds
 * array. If they are not, they are redirected to
 * the redirectUrl, which defaults to '/home' if
 * it is not explicitly provided.
 * @param {import('@ukef/dtfs2-common').TeamId[]} requiredTeamIds - List of required team ids
 * @param {string} redirectUrl - Url to redirect to if user does not have a required team
 */
const validateUserTeam = (requiredTeamIds, redirectUrl = '/home') => (req, res, next) => {
  const { user } = req.session;
  if (userIsInTeam(user, requiredTeamIds)) {
    return next();
  }
  return res.redirect(redirectUrl);
};

module.exports = validateUserTeam;
