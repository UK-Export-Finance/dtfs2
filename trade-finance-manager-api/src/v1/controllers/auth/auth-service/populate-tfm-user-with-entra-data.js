const mapEntraUserData = require('./map-entra-user-data');

/**
 * populateTfmUserWithEntraData
 * Populate TFM user data with Entra user data.
 * @param {import('src/types/auth/get-user-response').GetUserResponse} getUserResponse status and user info
 * @param {object} entraUser Entra user data
 * @returns {import('src/types/auth/get-user-response').GetUserResponse}
 */
const populateTfmUserWithEntraData = (getUserResponse, entraUser) => {
  const getUserResponsePopulated = { ...getUserResponse };
  getUserResponsePopulated.user = {
    ...getUserResponse.user,
    ...mapEntraUserData(entraUser, getUserResponse.user),
  };
  return getUserResponsePopulated;
};

module.exports = populateTfmUserWithEntraData;
