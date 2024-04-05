import { AzureUserInfoResponseAccount } from '../../../../types/auth/azure-user-info-response-account';

import authProvider from '../auth-provider.js';
import tfmUser from './get-or-create-tfm-user';
import { issueJwtAndUpdateUser } from './issue-jwt-and-update-user';
import { TfmUser } from '../../../../types/db-models/tfm-users.js';

/**
 * processSsoRedirect
 * Process SSO redirect.
 * 1) Get Entra user.
 * 2) Get TFM user. If no user exists, create a new one.
 * 3) Populate Entra and TFM user data.
 * 4) Issue a JWT and update TFM user data.
 * 7) Get redirect URL
 * 8) Return user data, token and redirect URL.
 * @param {Object} pkceCodes: PKCE Codes object
 * @param {Object} authCodeRequest: Auth code request
 * @param {String} code: authZ code
 * @param {String} state: MSAL state guid
 * @returns {Promise<Object>} TFM user, token and redirect URL.
 */
export const processSsoRedirect = async ({ pkceCodes, authCodeRequest, code, state }: {pkceCodes: unknown, authCodeRequest: unknown, code: string, state: string}) => {
  try {
    if (pkceCodes && authCodeRequest && code && state) {
      console.info('TFM auth service - processing SSO redirect');

      // await authProvider.handleRedirect(pkceCodes, authCodeRequest, code);
      const azureUserInfoResponseAccount: AzureUserInfoResponseAccount = await authProvider.handleRedirect(pkceCodes, authCodeRequest, code);

      const user: TfmUser = await tfmUser.getOrCreate(azureUserInfoResponseAccount);

      const token = await issueJwtAndUpdateUser(user);

      const redirectUrl = authProvider.loginRedirectUrl(state);

      return { tfmUser: user, token, redirectUrl };
    }

    return null;
  } catch (error) {
    console.error('TFM auth service - Error processing SSO redirect: %s', error);

    throw error;
  }
};
