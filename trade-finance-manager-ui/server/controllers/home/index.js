const { TEAMS } = require('../../constants');

const isInPDCTeam = (user) => user.teams.some((team) => team === TEAMS.PDC_READ || team === TEAMS.PDC_RECONCILE);

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
    return res.redirect('/login');
  }

  if (isInPDCTeam(user)) {
    return res.redirect('/utilisation-reports');
  }

  return res.redirect('/deals');
};

module.exports = {
  getUserHomepage,
};
