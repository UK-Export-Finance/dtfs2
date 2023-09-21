const ROLES = require('../src/v1/roles/roles');

const ALL_ROLES = Object.values(ROLES);

const getRolesListExcluding = (rolesToExclude) => ALL_ROLES.filter((role) => !rolesToExclude.includes(role));

const COMMON_ROLE_LISTS = {
  ALL_ROLES,
  NON_READ_ONLY_ROLES: getRolesListExcluding([ROLES.READ_ONLY]),
};

module.exports = COMMON_ROLE_LISTS;
