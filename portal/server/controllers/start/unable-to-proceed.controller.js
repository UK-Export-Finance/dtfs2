export const getUnableToProceedPage = (req, res) => {
  res.render('unable-to-proceed.njk', { user: req.session.user });
};
