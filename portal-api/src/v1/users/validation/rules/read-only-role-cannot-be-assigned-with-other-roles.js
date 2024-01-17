const { READ_ONLY } = require('../../../roles/roles');

const error = {
  roles: {
    text: "You cannot combine 'Read-only' with any of the other roles",
  },
};

const hasANonReadOnlyRole = (target) => target?.roles?.some((role) => role !== READ_ONLY);
const hasReadOnlyRole = (target) => target?.roles?.includes(READ_ONLY);

module.exports = (_user, change) => (hasReadOnlyRole(change) && hasANonReadOnlyRole(change) ? [error] : []);
