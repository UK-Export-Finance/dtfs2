import { GetAuthCodeUrlParams, GetAuthCodeUrlResponse } from '@ukef/dtfs2-common';
import * as api from '../api';

export class LoginService {
  /**
   * Gets the URL to redirect the user to in order to log in.
   */
  public getAuthCodeUrl = async ({ successRedirect }: GetAuthCodeUrlParams): Promise<GetAuthCodeUrlResponse> => {
    return api.getAuthCodeUrl({ successRedirect });
  };
}
