import { NextFunction } from 'express';
import {
  GetAuthCodeUrlApiRequest,
  GetAuthCodeUrlApiResponse,
  HandleSsoRedirectFormApiRequest,
  HandleSsoRedirectFormApiResponse,
  InvalidPayloadError,
} from '@ukef/dtfs2-common';
import { ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { isVerifiedPayload } from '@ukef/dtfs2-common/payload-verification';
import { validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { EntraIdService } from '../services/entra-id.service';
import { UserService } from '../services/user.service';
import utils from '../../utils/crypto.util';

export class SsoController {
  private readonly entraIdService: EntraIdService;
  private readonly userService: UserService;

  constructor({ entraIdService, userService }: { entraIdService: EntraIdService; userService: UserService }) {
    this.entraIdService = entraIdService;
    this.userService = userService;
  }

  async getAuthCodeUrl(req: GetAuthCodeUrlApiRequest, res: GetAuthCodeUrlApiResponse, next: NextFunction) {
    try {
      const { successRedirect } = req.params;
      const getAuthCodeUrlResponse = await this.entraIdService.getAuthCodeUrl({ successRedirect });
      return res.json(getAuthCodeUrlResponse);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Used as part of the SSO process
   *
   * This endpoint handles the TFM-API side of the SSO process following the automatic redirect from the Entra Id service.
   * It takes the response from the Entra Id service and processes it to create or update a user in the TFM-API database.
   * It then issues a JWT token for the user and returns it to the client.
   */
  async handleSsoRedirectForm(req: HandleSsoRedirectFormApiRequest, res: HandleSsoRedirectFormApiResponse, next: NextFunction) {
    try {
      const { body } = req;
      const { authCodeResponse, originalAuthCodeUrlRequest, auditDetails } = body;
      validateAuditDetailsAndUserType(auditDetails, 'system');

      if (!isVerifiedPayload({ payload: body, template: ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA })) {
        throw new InvalidPayloadError('Invalid payload from SSO redirect');
      }

      const { entraIdUser, successRedirect } = await this.entraIdService.handleRedirect({
        authCodeResponse,
        originalAuthCodeUrlRequest,
      });

      const user = await this.userService.upsertTfmUserFromEntraIdUser({ entraIdUser, auditDetails });

      const { sessionIdentifier, token, expires } = utils.issueJWT(user);

      await this.userService.saveUserLoginInformation({ userId: user._id, sessionIdentifier, auditDetails });

      const response = {
        user,
        successRedirect,
        token,
        expires,
      };

      return response;
    } catch (error) {
      return next(error);
    }
  }
}
