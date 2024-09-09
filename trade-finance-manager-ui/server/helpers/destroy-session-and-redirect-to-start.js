/**
 * Destroys a user's session and redirects them to the start page.
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @returns {void}
 */
function destroySessionAndRedirectToStart(req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}

module.exports = destroySessionAndRedirectToStart;
