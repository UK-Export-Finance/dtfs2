const ukefAdminRoles = ['ukef_operations'];

const userRoleIsValid = (requiredRoles, user) => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  const userHasOneOfTheRequiredRoles = ukefAdminRoles.some((adminRole) => user.roles.includes(adminRole))
        || requiredRoles.some((role) => user.roles.includes(role));
  return userHasOneOfTheRequiredRoles;
};

const validate = (opts) => {
  const requiredRoles = opts ? opts.role : null;

  return (req, res, next) => {
    if (userRoleIsValid(requiredRoles, req.user)) {
      next();
    } else {
      res.status(401).json({ success: false, msg: "you don't have the right role" });
    }
  };
};

module.exports = {
  userRoleIsValid,
  validate,
};
