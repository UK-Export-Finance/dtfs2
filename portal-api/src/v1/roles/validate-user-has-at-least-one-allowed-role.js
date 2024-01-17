const { userHasAtLeastOneAllowedRole } = require('./user-has-at-least-one-allowed-role');

/**
 * Creates a middleware that returns a 401 error if the current user does not
 * have at least one of the allowedRoles, and calls the next handler otherwise.
 * @param {{ allowedRoles: string[] }}
 * @returns {(req, res, next) => void}
 */
const validateUserHasAtLeastOneAllowedRole =
  ({ allowedRoles }) =>
  (req, res, next) => {
    const { user } = req;

    if (!userHasAtLeastOneAllowedRole({ user, allowedRoles })) {
      console.error('Unauthorised access for %s.', user);

      res.status(401).json({ success: false, msg: "You don't have access to this page" });
      return;
    }

    next();
  };

module.exports = {
  validateUserHasAtLeastOneAllowedRole,
};
