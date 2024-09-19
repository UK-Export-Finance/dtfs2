const existingTfmUser = require('./get-and-map-existing-tfm-user');
const tfmUser = require('./tfm-user');

/**
 * getOrCreateTfmUserForEntraUser
 * Get or create a TFM user.
 * - If a user is found from the provided Entra user and has canProceed=true, update the TFM user and return.
 * - If a user is found, but has canProceed=false, throw an error.
 * - If a user is not found, create a new TFM user from the provided Entra user data.
 * @param {import('src/types/auth/azure-user-info-response-account').AzureUserInfoResponseAccount} entraUser Entra user data
 * @returns {Promise<import('src/types/db-models/tfm-users').TfmUser>} New or existing TFM user
 */
const getOrCreateTfmUserForEntraUser = async (entraUser) => {
  try {
    console.info('TFM auth service - Getting or creating a TFM user');

    const getUserResponse = await existingTfmUser.getAndMapExistingTfmUserForEntraUser(entraUser);

    if (getUserResponse?.found) {
      console.info('TFM auth service - found an existing user');

      if (!getUserResponse.canProceed) {
        console.info('TFM auth service - user cannot proceed');
        throw new Error('TFM auth service - user cannot proceed');
      }
      console.info('TFM auth service - updating user');

      await tfmUser.update(getUserResponse.user._id, entraUser);

      return getUserResponse.user;
    }

    console.info('TFM auth service - no existing TFM user found. Creating a new TFM user');

    const createdUser = await tfmUser.create(entraUser);

    return createdUser;
  } catch (error) {
    console.error('TFM auth service - Getting or creating a TFM user %s', error);

    throw new Error('TFM auth service - Getting or creating a TFM user %s', error);
  }
};

module.exports = { getOrCreateTfmUserForEntraUser };
