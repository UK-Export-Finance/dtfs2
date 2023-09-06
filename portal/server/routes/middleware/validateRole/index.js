const { UKEF_OPERATIONS, ADMIN, UKEF_ADMIN } = require("../../../constants/roles");

const ukefAdminRoles = [UKEF_OPERATIONS, ADMIN, UKEF_ADMIN];

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
  if (!user) {
    return false;
  }

  const userHasOneOfTheRequiredRoles = ukefAdminRoles.some((adminRole) => user.roles.includes(adminRole))
                                    || requiredRoles.some((role) => user.roles.includes(role));
  return userHasOneOfTheRequiredRoles;
};
/**
 *
 * @param {object} opts  (i.e. { role: ['maker'] })
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
