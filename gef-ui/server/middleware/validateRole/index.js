const { ADMIN, UKEF_ADMIN, UKEF_OPERATIONS } = require('../../constants/roles');

const ukefAdminRoles = [ADMIN, UKEF_ADMIN, UKEF_OPERATIONS];

/**
 *
 * @param {array} requiredRoles  (i.e. [MAKER])
 * @param {array} user (i.e. [CHECKER] or [MAKER, CHECKER])
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
 * @param {object} opts  (i.e. { role: [MAKER] })
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
