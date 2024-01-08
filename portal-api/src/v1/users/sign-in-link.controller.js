const { HttpStatusCode } = require('axios');
const { LOGIN_STATUSES, SIGN_IN_LINK } = require('../../constants');
const { UserNotFoundError, InvalidSignInTokenError } = require('../errors');
const UserBlockedError = require('../errors/user-blocked.error');
const { sanitizeUser } = require('./sanitizeUserData');

class SignInLinkController {
  #signInLinkService;

  constructor(signInLinkService) {
    this.#signInLinkService = signInLinkService;
  }

  async loginWithSignInLink(req, res) {
    try {
      const { userId, signInToken } = req.params;

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
          return res.status(HttpStatusCode.Forbidden).send({
            message: 'Forbidden',
            errors: [
              {
                msg: `The provided token is no longer valid for user with id ${req.params.userId}`,
              },
            ],
          });
        }
        case SIGN_IN_LINK.STATUS.VALID: {
          await this.#signInLinkService.deleteSignInToken(userId);

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
          throw InvalidSignInTokenError(userId);
      }
    } catch (e) {
      console.error(e);

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

      // TODO DTFS2-6910: update this to work properly
      if (e instanceof UserBlockedError) {
        return res.status(HttpStatusCode.Forbidden).send({
          message: 'Forbidden',
          errors: [
            {
              msg: e.message,
            },
          ],
        });
      }

      return res.status(HttpStatusCode.InternalServerError).send({
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
