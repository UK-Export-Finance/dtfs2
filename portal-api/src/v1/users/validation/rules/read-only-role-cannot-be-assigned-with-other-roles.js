const { READ_ONLY } = require('../../../roles/roles');

const error = {
  roles: {
    text: 'Users cannot have multiple roles if they have the read-only role.'
  },
};

const hasMultipleRoles = (target) => target && target.roles && target.roles.length > 1;
const hasReadOnlyRole = (target) => target && target.roles && target.roles.includes(READ_ONLY);

module.exports = (_user, change) => (hasReadOnlyRole(change) && hasMultipleRoles(change)
  ? [error]
  : []);
