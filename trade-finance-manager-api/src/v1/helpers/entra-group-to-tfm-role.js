require('dotenv').config();
const { TEAMS } = require('../../constants/teams')

const getRolesGroupedByEntraId = () => {
  const entraGroups = {};

  Object.values(TEAMS).forEach(group => {
    const azureId = process.env[group.ssoGroupEnvVar];
    entraGroups[azureId] = group.id;
  }, {});

  return entraGroups;
}

const getTfmRolesFromEntraGroups = (groupIds) => {
  const entraIdMap = getRolesGroupedByEntraId();
  const tfmRoles = groupIds.map(id => entraIdMap[id]);
  return tfmRoles;
}


module.exports = {
  getTfmRolesFromEntraGroups,
  getRolesGroupedByEntraId,
};
