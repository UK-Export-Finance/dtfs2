const { ROLES } = require('../../../constants');
const { getUserRoles } = require('../../../helpers');

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

  const userHasOneOfTheRequiredRoles = requiredRoles.some((role) => user.roles.includes(role));
  return userHasOneOfTheRequiredRoles;
};

/**
 * Redirects unauthorised user to their respective
 * home page.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
const redirectUnauthorisedUser = (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.redirect('/login');
  }

  if (user.roles.some((role) => role === ROLES.PAYMENT_REPORT_OFFICER)) {
    return res.redirect('/utilisation-report-upload');
  }
  return res.redirect('/dashboard/deals/0');
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
      return next();
    }
    return redirectUnauthorisedUser(req, res);
  };
};

module.exports = validateRole;
