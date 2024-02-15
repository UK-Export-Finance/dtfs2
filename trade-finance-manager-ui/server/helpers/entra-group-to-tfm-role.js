require('dotenv').config();
const { TEAMS } = require('../constants/team-ids')

const getRolesGroupedByEntraId = () => {
  const entraGroups = {};

  Object.values(TEAMS).forEach(group => {
    const azureId = process.env[group.azure_id_env_var];
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
