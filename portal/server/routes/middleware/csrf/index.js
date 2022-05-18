module.exports = () => function csrfToken(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
};
