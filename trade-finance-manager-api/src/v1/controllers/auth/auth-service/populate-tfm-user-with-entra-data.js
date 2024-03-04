const mapEntraUserData = require('./map-entra-user-data');

/**
 * populateTfmUserWithEntraData
 * Populate TFM user data with Entra user data.
 * @param {Object} tfmUser: Existing TFM user data
 * @param {Object} entraUser: Entra user data
 * @returns 
 */
const populateTfmUserWithEntraData = (tfmUser, entraUser) => ({
  ...tfmUser,
  ...mapEntraUserData(entraUser, tfmUser),
});

module.exports = populateTfmUserWithEntraData;
