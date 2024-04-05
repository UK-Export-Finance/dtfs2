import { GetUserResponse } from '../../../../types/auth/get-user-response';
import { AzureUserInfoResponseAccount } from '../../../../types/auth/azure-user-info-response-account';
import tfmUser from './get-existing-tfm-user';
import populateTfmUserWithEntraData from './populate-tfm-user-with-entra-data';

/**
 * getAndMapExistingTfmUser
 * Get and map an existing TFM user from Entra user data.
 * @param {Object} entraUser: Entra user data
 * @returns {Promise<GetUserResponse>} TFM user with mapped data
 */
export const getAndMap = async (azureUserInfoResponseAccount: AzureUserInfoResponseAccount): Promise<GetUserResponse> => {
  try {
    if (!azureUserInfoResponseAccount) {
      throw new Error('TFM auth service - azure user info is missing');
    }
    console.info('TFM auth service - getting and mapping existing TFM user');

    const getUserResponse: GetUserResponse = await tfmUser.get(azureUserInfoResponseAccount);

    const mapped: GetUserResponse = populateTfmUserWithEntraData(getUserResponse, azureUserInfoResponseAccount);

    return mapped;
  } catch (error: unknown) {
    console.error('TFM auth service - Error getting and mapping existing TFM user %s', error);

    throw new Error('TFM auth service - Error getting and mapping existing TFM user', { cause: error });
  }
};

export default { getAndMap };
