const mapEntraUserData = require('./map-entra-user-data');

/**
 * populateTfmUserWithEntraData
 * Populate TFM user data with Entra user data.
 * @param {Object} tfmUser: Existing TFM user data
 * @param {import('src/types/auth/azure-user-info-response-account').AzureUserInfoResponseAccount} entraUser: Entra user data
 * @returns {import('src/types/auth/get-user-response').GetUserResponse}
 */
const populateTfmUserWithEntraData = (tfmUser, entraUser) => ({
  ...tfmUser,
  ...mapEntraUserData(entraUser, tfmUser),
});

module.exports = populateTfmUserWithEntraData;
