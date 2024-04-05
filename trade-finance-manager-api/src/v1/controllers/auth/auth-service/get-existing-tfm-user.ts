import { AzureUserInfoResponseAccount } from '../../../../types/auth/azure-user-info-response-account';
import { GetUserResponse } from '../../../../types/auth/get-user-response';
import userController from '../../user/user.controller';

/**
 * get
 * Get an existing TFM user with a matching Entra use email(s)
 * Note: an Entra user could have just a primary email, no secondary email.
 * @param {import('src/types/auth/get-user-response').GetUserResponse} entraUser: Entra user data
 * @returns {Promise<GetUserResponse>}
 */
export const get = async (entraUser: AzureUserInfoResponseAccount): Promise<GetUserResponse> => {
  try {
    if (!entraUser?.idTokenClaims) {
      throw new Error('TFM auth service - Error - Entra idTokenClaims are missing');
    }
    console.info('TFM auth service - Getting existing TFM user');

    const claims = entraUser.idTokenClaims;

    // verified_primary_email is always array.
    let emails = claims.verified_primary_email;

    // verified_secondary_email is always array.
    if (claims.verified_secondary_email) {
      emails = [...emails, ...claims.verified_secondary_email];
    }

    const user: GetUserResponse = await userController.findByEmails(emails);

    return user;
  } catch (error) {
    console.error('TFM auth service - Error - Getting existing TFM user %O', error);

    throw new Error('TFM auth service - Error - Getting existing TFM user', { cause: error});
  }
};

export default {get}