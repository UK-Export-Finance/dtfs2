require('dotenv').config();
const { TEAMS } = require('../../constants/teams');

/**
 * getTfmRolesGroupedByEntraId
 * Get TFM roles grouped by Entra group IDs.
 * Teams are mapped to a specific Entra group ID.
 * @returns {Record<string, import('@ukef/dtfs2-common').TeamId>} TFM roles
 */
const getTfmRolesGroupedByEntraId = () => {
  const roles = {};

  Object.values(TEAMS).forEach((team) => {
    const azureId = process.env[team.ssoGroupEnvVar];

    if (!azureId) {
      throw new Error(`SSO group environment variable not found for team: ${team.name}`);
    }

    roles[azureId] = team.id;
  }, {});

  return roles;
};

/**
 * getTfmRolesFromEntraGroups
 * Get TFM roles from Entra groups.
 * @param {Array} groupIds: Entra Group IDs
 * @returns {import('@ukef/dtfs2-common').TeamId[]} TFM roles
 */
const getTfmRolesFromEntraGroups = (groupIds) => {
  const entraIdMap = getTfmRolesGroupedByEntraId();

  const tfmRoles = groupIds.map((id) => entraIdMap[id]).filter((group) => group !== undefined);

  return tfmRoles;
};

module.exports = {
  getTfmRolesFromEntraGroups,
};
