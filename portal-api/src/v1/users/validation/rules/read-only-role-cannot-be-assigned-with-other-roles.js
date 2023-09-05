const error = {
  roles: {
    text: 'Users cannot have multiple roles if they have the read-only role.'
  },
};

const hasMultipleRoles = (target) => target && target.roles && target.roles.length > 1;
const hasReadOnlyRole = (target) => target && target.roles && target.roles.includes('read-only'); // TODO DTFS2-6647: use constant

module.exports = (_user, change) => (hasReadOnlyRole(change) && hasMultipleRoles(change)
  ? [error]
  : []);
