import {
  ApiError,
  GetAuthCodeUrlApiRequest,
  GetAuthCodeUrlApiResponse,
  HandleSsoRedirectFormApiRequest,
  HandleSsoRedirectFormApiResponse,
  HandleSsoRedirectFormResponse,
  InvalidPayloadError,
} from '@ukef/dtfs2-common';
import { ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA, TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { isVerifiedPayload } from '@ukef/dtfs2-common/payload-verification';
import { validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { HttpStatusCode } from 'axios';
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

  public async getAuthCodeUrl(req: GetAuthCodeUrlApiRequest, res: GetAuthCodeUrlApiResponse) {
    try {
      const { successRedirect } = req.params;
      const getAuthCodeUrlResponse = await this.entraIdService.getAuthCodeUrl({ successRedirect });
      res.json(getAuthCodeUrlResponse);
    } catch (error) {
      const errorMessage = 'Failed to get auth code url';
      console.error(errorMessage, error);

      if (error instanceof ApiError) {
        res.status(error.status).send({
          status: error.status,
          message: `${errorMessage}: ${error.message}`,
          code: error.code,
        });
        return;
      }
      res.status(HttpStatusCode.InternalServerError).send({
        status: HttpStatusCode.InternalServerError,
        message: errorMessage,
      });
    }
  }

  /**
   * Used as part of the SSO process
   *
   * This endpoint handles the TFM-API side of the SSO process following the automatic redirect from the Entra Id service.
   * It takes the response from the Entra Id service and processes it to create or update a user in the TFM-API database.
   * It then issues a JWT token for the user and returns it to the client.
   */
  public async handleSsoRedirectForm(req: HandleSsoRedirectFormApiRequest, res: HandleSsoRedirectFormApiResponse) {
    try {
      const { body } = req;
      const { authCodeResponse, originalAuthCodeUrlRequest, auditDetails } = body;
      validateAuditDetailsAndUserType(auditDetails, 'system');

      /**
       * We only validate the authCodeResponse here as the originalAuthCodeUrlRequest type (AuthorizationUrlRequest) is
       * part of the MSAL auth library, so we allow the MSAL library to handle this for us, and
       * we've already validated the auditDetails.
       */
      if (!isVerifiedPayload({ payload: authCodeResponse, template: ENTRA_ID_AUTH_CODE_REDIRECT_RESPONSE_BODY_SCHEMA })) {
        throw new InvalidPayloadError('Invalid payload from SSO redirect');
      }

      const { entraIdUser, successRedirect } = await this.entraIdService.handleRedirect({
        authCodeResponse,
        originalAuthCodeUrlRequest,
      });

      const user = await this.userService.upsertTfmUserFromEntraIdUser({ entraIdUser, auditDetails });

      const { sessionIdentifier, token, expires } = utils.issueJWT(user);

      await this.userService.saveUserLoginInformation({ userId: user._id, sessionIdentifier, auditDetails });

      const response: HandleSsoRedirectFormResponse = {
        user: TFM_SESSION_USER_SCHEMA.parse(user),
        token,
        expires,
        successRedirect,
      };

      res.send(response);
    } catch (error) {
      const errorMessage = 'Failed to handle redirect form';
      console.error(errorMessage, error);
      if (error instanceof ApiError) {
        res.status(error.status).send({
          status: error.status,
          message: `${errorMessage}: ${error.message}`,
          code: error.code,
        });
        return;
      }

      res.status(HttpStatusCode.InternalServerError).send({
        status: HttpStatusCode.InternalServerError,
        message: errorMessage,
      });
    }
  }
}
