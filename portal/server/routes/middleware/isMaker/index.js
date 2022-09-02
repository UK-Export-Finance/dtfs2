const isMaker = (req, res, next) => {
  const { user } = req.session;

  if (!user || !user.roles.includes('maker')) {
    return res.redirect('/');
  }

  return next();
};

module.exports = isMaker;
