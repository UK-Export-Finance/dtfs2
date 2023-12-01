const { userIsInTeam } = require('../../helpers/user');
const { TEAM_IDS } = require('../../constants');

/**
 * Route to handle default user routing when redirected.
 * If no user is logged in, this sends the user to the
 * login page. If a user is logged in, this sends the
 * user to their respective 'home' page depending on
 * their team.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
const getUserHomepage = (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.redirect('/');
  }

  if (userIsInTeam(user, [TEAM_IDS.PDC_READ, TEAM_IDS.PDC_RECONCILE])) {
    return res.redirect('/utilisation-reports');
  }
  return res.redirect('/deals');
};

module.exports = {
  getUserHomepage,
};
