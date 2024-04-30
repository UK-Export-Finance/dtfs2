const { userHasAtLeastOneAllowedRole } = require('./user-has-at-least-one-allowed-role');

/**
 * Creates a middleware that returns a 401 error if the current user logs with
 * old password have at least one of the allowedRoles, and calls the next handler otherwise.
 * @param {{ allowedRoles: string[] }}
 * @returns {(req, res, next) => void}
 */
const validateUserIsActingOnSelfToChangePasswordOrIsAdmin = ({ allowedRoles }) => (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({ success: false, msg: "You don't have access to this page" });
  }

  const isOldPassword = req.body.oldPassword === req.user.password;
  const hasAllowedRole = userHasAtLeastOneAllowedRole(req.user, allowedRoles);

  if (isOldPassword && hasAllowedRole) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }

    return next();


};


module.exports = {
  validateUserIsActingOnSelfToChangePasswordOrIsAdmin,
};
