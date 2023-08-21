const { userHasSufficientRole } = require('./user-has-sufficient-role');

const validateUserHasSufficientRole = ({
  allowedRoles,
}) => (req, res, next) => {
  const { user } = req;
  const userHasSufficientRolesToAccessNext = userHasSufficientRole({ user, allowedRoles });

  if (userHasSufficientRolesToAccessNext) {
    next();
    return;
  }
  res.status(401).json({ success: false, msg: "You don't have access to this page" });
};

module.exports = {
  validateUserHasSufficientRole,
};
