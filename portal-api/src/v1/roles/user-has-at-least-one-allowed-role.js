const { ADMIN } = require('./roles');

const userHasRole = ({
  user,
  targetRole,
}) => {
  const { roles: userRoles } = user;
  return userRoles.includes(targetRole);
};

/**
 * Returns true if the user has at least one of allowedRoles.
 * Returns false otherwise.
 * @param {{ user: { roles: string[] }, allowedRoles: string[] }}
 * @returns {boolean}
 */
const userHasAtLeastOneAllowedRole = ({
  user,
  allowedRoles,
}) => {
  if (userHasRole({ user, targetRole: ADMIN })) {
    return true;
  }
  return allowedRoles.some((allowedRole) => userHasRole({ user, targetRole: allowedRole }));
};

module.exports = {
  userHasAtLeastOneAllowedRole,
};
