const { userHasSufficientRole } = require('./user-has-sufficient-role');

/**
 * Creates a middleware that returns a 401 error if the current user does
 * not have sufficient role(s), given a list of allowed non-admin roles.
 * @param {{ allowedNonAdminRoles: string[] }}
 * @returns {(req, res, next) => void}
 */
const validateUserHasSufficientRole = ({
  allowedNonAdminRoles,
}) => (req, res, next) => {
  const { user } = req;
  const userHasSufficientRolesToAccessNext = userHasSufficientRole({ user, allowedNonAdminRoles });

  if (userHasSufficientRolesToAccessNext) {
    next();
    return;
  }

  res.status(401).json({ success: false, msg: "You don't have access to this page" });
};

module.exports = {
  validateUserHasSufficientRole,
};
