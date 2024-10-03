/**
 *
 * @param {Array} requiredRoles  (i.e. ['maker'])
 * @param {Array} user (i.e. ['checker'] or ['maker', 'checker'])
 * @returns {boolean}
 *
 */
const userRoleIsValid = (requiredRoles, user) => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  if (!user) {
    return false;
  }

  const userHasOneOfTheRequiredRoles = requiredRoles.some((role) => user.roles.includes(role));
  return userHasOneOfTheRequiredRoles;
};

/**
 *
 * @param {Object} opts  (i.e. { role: [MAKER] })
 *
 */
const validateRole = (opts, getRedirectUrl = () => '/') => {
  const requiredRoles = opts ? opts.role : null;

  return (req, res, next) => {
    if (userRoleIsValid(requiredRoles, req.session.user)) {
      return next();
    }
    return res.redirect(getRedirectUrl(req));
  };
};

module.exports = validateRole;
