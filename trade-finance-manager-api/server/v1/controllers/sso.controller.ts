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

  /**
   * Handles the request to retrieve the authorization code URL.
   *
   * This method interacts with the `entraIdService` to generate an authorization
   * code URL based on the provided `successRedirect` parameter in the request body.
   * If successful, it responds with the generated URL. In case of an error, it
   * handles both API-specific errors and general server errors, returning appropriate
   * HTTP status codes and error messages.
   *
   * @param req - The API request object containing the `successRedirect` in the body.
   * @param res - The API response object used to send the response or error.
   *
   * @throws {ApiError} If an API-specific error occurs, it responds with the error's
   * status, message, and code.
   * @throws {Error} For general errors, it responds with a 500 Internal Server Error
   * and a generic error message.
   */
  public async getAuthCodeUrl(req: GetAuthCodeUrlApiRequest, res: GetAuthCodeUrlApiResponse) {
    try {
      const { successRedirect } = req.body;
      const getAuthCodeUrlResponse = await this.entraIdService.getAuthCodeUrl({ successRedirect });

      res.json(getAuthCodeUrlResponse);
    } catch (error) {
      const errorMessage = 'Failed to get auth code url';
      console.error('%s %o', errorMessage, error);

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
   * Handles the SSO redirect form submission by validating the payload, processing the authentication response,
   * and issuing a JWT for the authenticated user.
   *
   * @param req - The API request object containing the SSO redirect form data.
   * @param res - The API response object used to send the response back to the client.
   *
   * @throws {InvalidPayloadError} If the `authCodeResponse` payload fails validation.
   * @throws {ApiError} If an API-specific error occurs during processing.
   * @throws {Error} For any other unexpected errors.
   *
   * The method performs the following steps:
   * 1. Validates the `auditDetails` and ensures the user type is 'system'.
   * 2. Validates the `authCodeResponse` payload against the expected schema.
   * 3. Processes the SSO redirect using the `entraIdService` to retrieve user claims and a success redirect URL.
   * 4. Upserts the user in the database using the `userService` based on the ID token claims.
   * 5. Issues a JWT for the authenticated user and saves login information.
   * 6. Sends a response containing the user details, token, expiration time, and success redirect URL.
   *
   * If an error occurs, it logs the error and sends an appropriate error response to the client.
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

      const { idTokenClaims, successRedirect } = await this.entraIdService.handleRedirect({
        authCodeResponse,
        originalAuthCodeUrlRequest,
      });

      const user = await this.userService.upsertTfmUserFromEntraIdUser({ idTokenClaims, auditDetails });
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

      console.error('%s %o', errorMessage, error);

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
