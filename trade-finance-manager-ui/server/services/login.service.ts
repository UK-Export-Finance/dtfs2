import { GetAuthCodeUrlParams, GetAuthCodeUrlResponse, HandleSsoRedirectFormRequest, HandleSsoRedirectFormResponse } from '@ukef/dtfs2-common';
import * as api from '../api';

export class LoginService {
  /**
   * Gets the URL to redirect the user to in order to log in.
   */
  public static getAuthCodeUrl = async ({ successRedirect }: GetAuthCodeUrlParams): Promise<GetAuthCodeUrlResponse> => {
    return await api.getAuthCodeUrl({ successRedirect });
  };

  public static handleSsoRedirectForm = async ({
    authCodeResponse,
    originalAuthCodeUrlRequest,
    auditDetails,
  }: HandleSsoRedirectFormRequest): Promise<HandleSsoRedirectFormResponse> => {
    return await api.handleSsoRedirectForm({ authCodeResponse, originalAuthCodeUrlRequest, auditDetails });
  };
}
