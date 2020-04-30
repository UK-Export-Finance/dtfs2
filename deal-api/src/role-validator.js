const ukefAdminRoles = ['ukef_operations'];

module.exports = (opts) => {
  const requiredRoles = opts ? opts.role : null;

  return (req, res, next) => {
    if (!requiredRoles || requiredRoles.length === 0) {
      next();
    } else {
      const userHasOneOfTheRequiredRoles = ukefAdminRoles.some((adminRole) => req.user.roles.includes(adminRole))
        || requiredRoles.some((role) => req.user.roles.includes(role));

      if (userHasOneOfTheRequiredRoles) {
        next();
      } else {
        res.status(401).json({ success: false, msg: "you don't have the right role" });
      }
    }
  };
};
