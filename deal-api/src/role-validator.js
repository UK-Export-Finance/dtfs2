module.exports = (opts) => {
  const role = opts ? opts.role : null;

  return (req, res, next) => {
    if (!role) {
      next();
    }

    if (role) {
      if (!req.user.roles.includes(role)) {
        res.status(401).json({ succes: false, msg: "you don't have the right role" });
      } else {
        next();
      }
    }
  };
};
