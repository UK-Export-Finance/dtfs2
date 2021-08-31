export const sessionUserToLocals = (req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
  }

  return next();
};

export default { sessionUserToLocals };
