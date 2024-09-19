const { getExistingTfmUserForEntraUser } = require('./get-existing-tfm-user');
const populateTfmUserWithEntraData = require('./populate-tfm-user-with-entra-data');

/**
 * getAndMapExistingTfmUserForEntraUser
 * Get and map an existing TFM user from Entra user data.
 * @param {import('src/types/auth/azure-user-info-response-account').AzureUserInfoResponseAccount} entraUser Entra user data
 * @returns {Promise<import('src/types/auth/get-user-response').GetUserResponse | {}>} TFM user with mapped data
 */
const getAndMapExistingTfmUserForEntraUser = async (entraUser) => {
  if (!entraUser) {
    return {};
  }

  try {
    console.info('TFM auth service - getting and mapping existing TFM user');

    const getUserResponse = await getExistingTfmUserForEntraUser(entraUser);

    const getUserResponseMapped = populateTfmUserWithEntraData(getUserResponse, entraUser);

    return getUserResponseMapped;
  } catch (error) {
    console.error('TFM auth service - Error getting and mapping existing TFM user %s', error);

    throw new Error('TFM auth service - Error getting and mapping existing TFM user %s', error);
  }
};

module.exports = { getAndMapExistingTfmUserForEntraUser };
