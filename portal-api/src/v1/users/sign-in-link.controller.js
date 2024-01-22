const { HttpStatusCode } = require('axios');
const { LOGIN_STATUSES, SIGN_IN_LINK, HTTP_ERROR_CAUSES } = require('../../constants');
const { UserNotFoundError, InvalidSignInTokenError, InvalidUserIdError } = require('../errors');
const UserBlockedError = require('../errors/user-blocked.error');
const UserDisabledError = require('../errors/user-disabled.error');
const { sanitizeUser } = require('./sanitizeUserData');

class SignInLinkController {
  #signInLinkService;

  constructor(signInLinkService) {
    this.#signInLinkService = signInLinkService;
  }

  async loginWithSignInLink(req, res) {
    try {
      const { userId, signInToken } = req.params;

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
          await this.#signInLinkService.resetSignInData(userId);

          const { user, tokenObject } = await this.#signInLinkService.loginUser(userId);

          return res.status(HttpStatusCode.Ok).json({
            success: true,
            token: tokenObject.token,
            user: sanitizeUser(user),
            loginStatus: LOGIN_STATUSES.VALID_2FA,
            expiresIn: tokenObject.expires,
          });
        }

        default:
          throw InvalidSignInTokenError(signInToken);
      }
    } catch (e) {
      console.error('Error during login with sign in link: %s', e);

      if (e instanceof InvalidSignInTokenError) {
        return res.status(HttpStatusCode.BadRequest).json({
          message: 'Bad Request',
          errors: [
            {
              msg: `Invalid sign in token ${req.params.signInToken}`,
            },
          ],
        });
      }

      if (e instanceof InvalidUserIdError) {
        return res.status(HttpStatusCode.BadRequest).json({
          message: 'Bad Request',
          errors: [
            {
              msg: `Invalid user id ${req.params.userId}`,
            },
          ],
        });
      }

      if (e instanceof UserNotFoundError) {
        return res.status(HttpStatusCode.NotFound).json({
          message: 'Not Found',
          errors: [
            {
              msg: `No user found with id ${req.params.userId}`,
            },
          ],
        });
      }

      if (e instanceof UserBlockedError) {
        return res.status(HttpStatusCode.Forbidden).json({
          message: 'Forbidden',
          errors: [
            {
              cause: HTTP_ERROR_CAUSES.USER_BLOCKED,
              msg: e.message,
            },
          ],
        });
      }

      if (e instanceof UserDisabledError) {
        return res.status(HttpStatusCode.Forbidden).json({
          message: 'Forbidden',
          errors: [
            {
              cause: HTTP_ERROR_CAUSES.USER_DISABLED,
              msg: e.message,
            },
          ],
        });
      }

      return res.status(HttpStatusCode.InternalServerError).json({
        message: 'Internal Server Error',
        errors: [
          {
            msg: e.message,
          },
        ],
      });
    }
  }

  async createAndEmailSignInLink(req, res) {
    try {
      const numberOfSendSignInLinkAttemptsRemaining = await this.#signInLinkService.createAndEmailSignInLink(req.user);
      return res.status(201).json({ numberOfSendSignInLinkAttemptsRemaining });
    } catch (e) {
      console.error(e);
      if (e instanceof UserBlockedError) {
        return res.status(HttpStatusCode.Forbidden).send({
          error: 'Forbidden',
          message: e.message,
        });
      }
      return res.status(HttpStatusCode.InternalServerError).send({
        error: 'Internal Server Error',
        message: e.message,
      });
    }
  }
}

module.exports = {
  SignInLinkController,
};
