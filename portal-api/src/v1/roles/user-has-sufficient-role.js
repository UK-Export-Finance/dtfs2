const { UKEF_OPERATIONS } = require('./roles');

const userHasRole = ({
  user,
  targetRole,
}) => {
  const { roles: userRoles } = user;
  return userRoles.includes(targetRole);
};

const userHasSufficientRole = ({
  user,
  allowedRoles,
}) => {
  if (userHasRole({ user, targetRole: UKEF_OPERATIONS })) {
    return true;
  }
  return allowedRoles.some((allowedRole) => userHasRole({ user, targetRole: allowedRole }));
};

module.exports = {
  userHasSufficientRole,
};
