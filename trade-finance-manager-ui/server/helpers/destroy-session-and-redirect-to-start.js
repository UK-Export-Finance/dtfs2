/**
 * Destroys a user's session and redirects them to the start page.
 * @param {Object} req
 * @param {Object} res
 * @returns {void}
 */
function destroySessionAndRedirectToStart(req, res) {
  console.info('Invalid user JWT destroying session');
  req.session.destroy(() => {
    res.redirect('/');
  });
}

module.exports = destroySessionAndRedirectToStart;
