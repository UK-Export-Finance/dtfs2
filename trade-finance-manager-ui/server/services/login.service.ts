import { GetAuthCodeUrlParams, GetAuthCodeUrlResponse, HandleSsoRedirectFormRequest } from '@ukef/dtfs2-common';
import { PartiallyLoggedInUserSessionData } from '../types/express-session';
import * as api from '../api';

type HandleSsoRedirectFormAndCreateTokenRequest = {
  session: PartiallyLoggedInUserSessionData;
} & HandleSsoRedirectFormRequest;

type HandleSsoRedirectFormAndCreateTokenResponse = {
  successRedirect: string;
};

export class LoginService {
  /**
   * Gets the URL to redirect the user to in order to log in.
   */
  public getAuthCodeUrl = async ({ successRedirect }: GetAuthCodeUrlParams): Promise<GetAuthCodeUrlResponse> => {
    return api.getAuthCodeUrl({ successRedirect });
  };

  public handleSsoRedirectFormAndCreateToken = async ({
    authCodeResponse,
    originalAuthCodeUrlRequest,
    // TODO as part of this ticket: uncomment the session parameter
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    session,
    auditDetails,
  }: HandleSsoRedirectFormAndCreateTokenRequest): Promise<HandleSsoRedirectFormAndCreateTokenResponse> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user, userToken, successRedirect } = await api.handleSsoRedirectForm({ authCodeResponse, originalAuthCodeUrlRequest, auditDetails });

    // TODO: This can be moved into a separate session service
    // delete session.loginData;
    // session.user = user;
    // session.userToken = userToken;

    return { successRedirect };
  };

  public getSuccessRedirect = () => {};
}
