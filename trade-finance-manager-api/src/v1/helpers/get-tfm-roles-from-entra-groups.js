require('dotenv').config();
const { TEAMS } = require('../../constants/teams')

/**
 * getTfmRolesGroupedByEntraId
 * Get TFM roles grouped by Entra group IDs.
 * @returns {Array} TFM roles
 */
const getTfmRolesGroupedByEntraId = () => {
  const roles = {};

  Object.values(TEAMS).forEach(group => {
    const azureId = process.env[group.ssoGroupEnvVar];

    roles[azureId] = group.id;
  }, {});

  return roles;
}

/**
 * getTfmRolesFromEntraGroups
 * Get TFM roles from Entra groups.
 * @param {Array} groupIds: Entra Group IDs
 * @returns {Array} TFM roles
 */
const getTfmRolesFromEntraGroups = (groupIds) => {
  const entraIdMap = getTfmRolesGroupedByEntraId();

  const tfmRoles = groupIds.map(id => entraIdMap[id]);

  return tfmRoles;
}

module.exports = {
  getTfmRolesFromEntraGroups,
  getTfmRolesGroupedByEntraId,
};
