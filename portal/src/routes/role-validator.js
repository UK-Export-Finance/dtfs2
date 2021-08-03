const ukefAdminRoles = ['ukef_operations'];

const userRoleIsValid = (requiredRoles, user) => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  if (!user) {
    return false;
  }

  const userHasOneOfTheRequiredRoles = ukefAdminRoles.some((adminRole) => user.roles.includes(adminRole))
        || requiredRoles.some((role) => user.roles.includes(role));
  return userHasOneOfTheRequiredRoles;
};

const validate = (opts) => {
  const requiredRoles = opts ? opts.role : null;

  return (req, res, next) => {
    if (userRoleIsValid(requiredRoles, req.session.user)) {
      next();
    } else {
      res.redirect('/not-found');
    }
  };
};

module.exports = {
  userRoleIsValid,
  validate,
};
