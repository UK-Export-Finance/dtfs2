const { LONDON_TIMEZONE } = require('@ukef/dtfs2-common');
const { getTfmRolesFromEntraGroups } = require('../../../helpers/get-tfm-roles-from-entra-groups');
const { mapFirstAndLastName } = require('./map-first-and-last-name');

/**
 * Map Entra user data
 * @param {object} entraUser Entra user data
 * @param {object} tfmUser Optional TFM user object.
 * @returns {import('src/types/db-models/tfm-users').TfmUserMappedFromEntraUser} Mapped user data
 */
const mapEntraUserData = (entraUser, tfmUser) => {
  const claims = entraUser.idTokenClaims;

  const { oid, email, groups } = claims;

  const mappedUser = {
    azureOid: oid,
    email,
    username: email,
    teams: getTfmRolesFromEntraGroups(groups),
    timezone: LONDON_TIMEZONE,
    ...mapFirstAndLastName(claims, tfmUser),
  };

  return mappedUser;
};

module.exports = mapEntraUserData;
