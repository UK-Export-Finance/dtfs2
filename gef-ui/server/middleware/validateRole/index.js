const ukefAdminRoles = ['ukef_operations', 'admin', 'ukef_admin'];

/**
 *
 * @param {array} requiredRoles  (i.e. ['maker'])
 * @param {array} user (i.e. ['checker'] or ['maker', 'checker'])
 * @returns {boolean}
 *
 */
const userRoleIsValid = (requiredRoles, user) => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  const userHasOneOfTheRequiredRoles = ukefAdminRoles.some((adminRole) => user.roles.includes(adminRole))
                                    || requiredRoles.some((role) => user.roles.includes(role));
  return userHasOneOfTheRequiredRoles;
};
/**
 *
 * @param {array} opts  (i.e. ['maker'])
 *
 */
const validateRole = (opts) => {
  const requiredRoles = opts ? opts.role : null;

  return (req, res, next) => {
    if (userRoleIsValid(requiredRoles, req.session.user)) {
      next();
    } else {
      res.redirect('/');
    }
  };
};

module.exports = validateRole;
