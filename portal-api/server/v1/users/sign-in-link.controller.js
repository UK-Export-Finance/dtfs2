const { HttpStatusCode } = require('axios');
const { generateNoUserLoggedInAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { PORTAL_LOGIN_STATUS, OTP_ERROR_CAUSES } = require('@ukef/dtfs2-common');
const { SIGN_IN_LINK, HTTP_ERROR_CAUSES } = require('../../constants');
const { UserNotFoundError, InvalidSignInTokenError, InvalidUserIdError, InvalidOTPError } = require('../errors');
const UserBlockedError = require('../errors/user-blocked.error');
const UserDisabledError = require('../errors/user-disabled.error');
const { sanitizeUser } = require('./sanitizeUserData');
const api = require('../api');

class SignInLinkController {
  #signInLinkService;

  constructor(signInLinkService) {
    this.#signInLinkService = signInLinkService;
  }

  async loginWithSignInLink(req, res) {
    try {
      const { userId, signInToken } = req.params;
      const auditDetails = generatePortalAuditDetails(userId);

      if (req.user._id.toString() !== userId) {
        throw new InvalidUserIdError(userId);
      }

      const signInTokenStatus = await this.#signInLinkService.getSignInTokenStatus({ userId, signInToken });

      switch (signInTokenStatus) {
        case SIGN_IN_LINK.STATUS.NOT_FOUND: {
          return res.status(HttpStatusCode.NotFound).json({
            message: 'Not Found',
            errors: [
              {
                msg: `No matching token for user with id ${req.params.userId}`,
              },
            ],
          });
        }
        case SIGN_IN_LINK.STATUS.EXPIRED: {
          return res.status(HttpStatusCode.Forbidden).json({
            message: 'Forbidden',
            errors: [
              {
                cause: HTTP_ERROR_CAUSES.TOKEN_EXPIRED,
                msg: `The provided token is no longer valid for user with id ${req.params.userId}`,
              },
            ],
          });
        }
        case SIGN_IN_LINK.STATUS.VALID: {
          await this.#signInLinkService.resetSignInData(userId, auditDetails);

          const { user, tokenObject } = await this.#signInLinkService.loginUser(userId, auditDetails);

          return res.status(HttpStatusCode.Ok).json({
            success: true,
            token: tokenObject.token,
            user: sanitizeUser(user),
            loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
            expiresIn: tokenObject.expires,
          });
        }

        default:
          throw InvalidSignInTokenError(signInToken);
      }
    } catch (error) {
      console.error('Error during login with sign in link %o', error);

      if (error instanceof InvalidSignInTokenError) {
        return res.status(HttpStatusCode.BadRequest).json({
          message: 'Bad Request',
          errors: [
            {
              msg: `Invalid sign in token ${req.params.signInToken}`,
            },
          ],
        });
      }

      if (error instanceof InvalidUserIdError) {
        return res.status(HttpStatusCode.BadRequest).json({
          message: 'Bad Request',
          errors: [
            {
              msg: `Invalid user id ${req.params.userId}`,
            },
          ],
        });
      }

      if (error instanceof UserNotFoundError) {
        return res.status(HttpStatusCode.NotFound).json({
          message: 'Not Found',
          errors: [
            {
              msg: `No user found with id ${req.params.userId}`,
            },
          ],
        });
      }

      if (error instanceof UserBlockedError) {
        return res.status(HttpStatusCode.Forbidden).json({
          message: 'Forbidden',
          errors: [
            {
              cause: HTTP_ERROR_CAUSES.USER_BLOCKED,
              msg: error.message,
            },
          ],
        });
      }

      if (error instanceof UserDisabledError) {
        return res.status(HttpStatusCode.Forbidden).json({
          message: 'Forbidden',
          errors: [
            {
              cause: HTTP_ERROR_CAUSES.USER_DISABLED,
              msg: error.message,
            },
          ],
        });
      }

      return res.status(HttpStatusCode.InternalServerError).json({
        message: 'Internal Server Error',
        errors: [
          {
            msg: error.message,
          },
        ],
      });
    }
  }

  /**
   * Logs in a user using a sign in OTP code.
   * If successful, returns a new user token and user details.
   * If non-successful flag returned, returns appropriate error response.
   * @param {Request} req request object containing userId and signInOTP
   * @param {Response} res response object
   * @returns {Promise<Response>} response object with status and data
   */
  async loginWithOTP(req, res) {
    try {
      const { userId, signInOTP } = req.params;
      const auditDetails = generatePortalAuditDetails(userId);

      if (req.user._id.toString() !== userId) {
        throw new InvalidUserIdError(userId);
      }

      const response = await api.verifySignInOTPCode(userId, signInOTP, auditDetails);

      const { success, isExpired, isInvalid, notFound } = response.data;

      switch (true) {
        case isExpired:
          return res.status(HttpStatusCode.Ok).json({
            message: 'Forbidden',
            errors: [
              {
                cause: OTP_ERROR_CAUSES.OTP_EXPIRED,
                msg: `The provided OTP has expired for user with id ${req.params.userId}`,
              },
            ],
          });

        case isInvalid:
          return res.status(HttpStatusCode.Ok).json({
            message: 'Forbidden',
            errors: [
              {
                cause: OTP_ERROR_CAUSES.OTP_INVALID,
                msg: `The provided OTP is not valid for user with id ${req.params.userId}`,
              },
            ],
          });

        case notFound:
          return res.status(HttpStatusCode.Ok).json({
            message: 'Not Found',
            errors: [
              {
                msg: `No OTP found for user with id ${req.params.userId}`,
              },
            ],
          });

        case success: {
          const { user, tokenObject } = response.data;

          return res.status(HttpStatusCode.Ok).json({
            success: true,
            token: tokenObject.token,
            user: sanitizeUser(user),
            loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
            expiresIn: tokenObject.expires,
          });
        }

        default:
          throw new InvalidOTPError(signInOTP);
      }
    } catch (error) {
      console.error('Error during login with sign in OTP %o', error);

      if (error instanceof InvalidOTPError) {
        return res.status(HttpStatusCode.BadRequest).json({
          message: 'Bad Request',
          errors: [
            {
              msg: `Invalid sign in OTP ${req.params.signInToken}`,
            },
          ],
        });
      }

      if (error instanceof InvalidUserIdError) {
        return res.status(HttpStatusCode.BadRequest).json({
          message: 'Bad Request',
          errors: [
            {
              msg: `Invalid user id ${req.params.userId}`,
            },
          ],
        });
      }

      if (error instanceof UserNotFoundError) {
        return res.status(HttpStatusCode.NotFound).json({
          message: 'Not Found',
          errors: [
            {
              msg: `No user found with id ${req.params.userId}`,
            },
          ],
        });
      }

      if (error instanceof UserBlockedError) {
        return res.status(HttpStatusCode.Forbidden).json({
          message: 'Forbidden',
          errors: [
            {
              cause: HTTP_ERROR_CAUSES.USER_BLOCKED,
              msg: error.message,
            },
          ],
        });
      }

      if (error instanceof UserDisabledError) {
        return res.status(HttpStatusCode.Forbidden).json({
          message: 'Forbidden',
          errors: [
            {
              cause: HTTP_ERROR_CAUSES.USER_DISABLED,
              msg: error.message,
            },
          ],
        });
      }

      return res.status(HttpStatusCode.InternalServerError).json({
        message: 'Internal Server Error',
        errors: [
          {
            msg: error.message,
          },
        ],
      });
    }
  }

  async createAndEmailSignInLink(req, res) {
    try {
      const auditDetails = generateNoUserLoggedInAuditDetails();
      const numberOfSendSignInLinkAttemptsRemaining = await this.#signInLinkService.createAndEmailSignInLink(req.user, auditDetails);
      return res.status(201).json({ numberOfSendSignInLinkAttemptsRemaining });
    } catch (error) {
      console.error('Error creating email sign in link %o', error);
      if (error instanceof UserBlockedError) {
        return res.status(HttpStatusCode.Forbidden).send({
          error: 'Forbidden',
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.InternalServerError).send({
        error: 'Internal Server Error',
        message: error.message,
      });
    }
  }

  /**
   * Creates and emails a sign in OTP to the user.
   * returns the number of remaining attempts and status 200 if successful.
   * @param {Request} req request object containing user details
   * @param {Response} res response object
   * @returns {Promise<Response>} response object with status and number of attempts remaining
   */
  async createAndEmailSignInOTP(req, res) {
    try {
      const auditDetails = generateNoUserLoggedInAuditDetails();

      const { signInOTPSendCount } = await api.createSignInOTPCode(req.user, auditDetails);

      return res.status(HttpStatusCode.Ok).json({ numberOfSendSignInLinkAttemptsRemaining: signInOTPSendCount });
    } catch (error) {
      console.error('Error creating email sign in OTP %o', error);
      if (error instanceof UserBlockedError) {
        return res.status(HttpStatusCode.Forbidden).send({
          error: 'Forbidden',
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.InternalServerError).send({
        error: 'Internal Server Error',
        message: error.message,
      });
    }
  }
}

module.exports = {
  SignInLinkController,
};
