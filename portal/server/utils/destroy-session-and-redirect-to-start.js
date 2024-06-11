/**
 * Destroys a user's session and redirects them to the start page.
 * @param {Object} req
 * @param {Object} res
 * @returns {void}
 */
function destroySessionAndRedirectToStart(req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
}

module.exports = destroySessionAndRedirectToStart;
