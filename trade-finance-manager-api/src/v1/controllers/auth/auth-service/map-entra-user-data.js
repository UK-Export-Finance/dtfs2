const { getTfmRolesFromEntraGroups } = require('../../../helpers/get-tfm-roles-from-entra-groups');
const { mapFirstAndLastName } = require('./map-first-and-last-name');
const { DATE } = require('../../../../constants');

/**
 * Map Entra user data
 * @param {object} entraUser Entra user data
 * @param {object} tfmUser Optional TFM user object.
 * @returns {object} Mapped user data
 */
const mapEntraUserData = (entraUser, tfmUser) => {
  const claims = entraUser.idTokenClaims;

  const { oid, email, groups } = claims;

  const mappedUser = {
    azureOid: oid,
    email,
    username: email,
    teams: getTfmRolesFromEntraGroups(groups),
    timezone: DATE.LONDON_TIMEZONE,
    ...mapFirstAndLastName(claims, tfmUser),
  };

  return mappedUser;
};

module.exports = mapEntraUserData;
