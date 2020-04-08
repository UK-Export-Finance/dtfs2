module.exports = (opts) => {
  const requiredRoles = opts ? opts.role : null;

  return (req, res, next) => {
    if (!requiredRoles || requiredRoles.length === 0) {
      next();
    } else {
      let userHasOneOfTheRequiredRoles = false;

      for (let i = 0; i <= requiredRoles.length; i += 1) {
        if (req.user.roles.includes(requiredRoles[i])) {
          userHasOneOfTheRequiredRoles = true;
        }
      }

      if (userHasOneOfTheRequiredRoles) {
        next();
      } else {
        res.status(401).json({ succes: false, msg: "you don't have the right role" });
      }
    }
  };
};
