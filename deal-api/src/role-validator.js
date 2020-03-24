module.exports = (opts) => {
  const { role } = opts;

  return (req, res, next) => {
    if (!req.user.roles.includes(role)) {
      res.status(401).json({ succes: false, msg: "you don't have the right role" });
    } else {
      next();
    }
  };
};
