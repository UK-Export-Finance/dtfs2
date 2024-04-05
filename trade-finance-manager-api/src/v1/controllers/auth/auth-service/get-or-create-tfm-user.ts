import { GetUserResponse } from '../../../../types/auth/get-user-response';
import { AzureUserInfoResponseAccount } from '../../../../types/auth/azure-user-info-response-account';
import existingTfmUser from './get-and-map-existing-tfm-user';
import tfmUser from './tfm-user';
import { TfmUser } from '../../../../types/db-models/tfm-users';

/**
 * getOrCreate
 * Get or create a TFM user.
 * - If a user is found from the provided Entra user and has canProceed=true, update the TFM user and return.
 * - If a user is found, but has canProceed=false, throw an error.
 * - If a user is not found, create a new TFM user from the provided Entra user data.
 * @param {Object} azureUserInfoResponseAccount: Entra user data
 * @returns {Promise<Object>} New or existing TFM user
 */
export const getOrCreate = async (azureUserInfoResponseAccount: AzureUserInfoResponseAccount): Promise<TfmUser> => {
  try {
    console.info('TFM auth service - Getting or creating a TFM user');

    const user: GetUserResponse = await existingTfmUser.getAndMap(azureUserInfoResponseAccount);

    if (user?.found) {
      console.info('TFM auth service - found an existing user');

      if (user.canProceed) {
        console.info('TFM auth service - updating user');

        await tfmUser.update(user._id, azureUserInfoResponseAccount);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {found, canProceed, ...userTrimmed} = user;

        return userTrimmed as TfmUser;
      }

      console.info("TFM auth service - user cannot proceed");
      throw new Error("TFM auth service - user cannot proceed");
    } else {
      console.info('TFM auth service - no existing TFM user found. Creating a new TFM user');

      const createdUser: TfmUser = await tfmUser.create(azureUserInfoResponseAccount);

      return createdUser;
    }
  } catch (error) {
    console.error('TFM auth service - Getting or creating a TFM user %s', error);

    throw new Error('TFM auth service - Getting or creating a TFM user', {cause: error});
  }
};

export default { getOrCreate }
