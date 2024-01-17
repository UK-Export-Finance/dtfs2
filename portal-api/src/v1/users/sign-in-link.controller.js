const { LOGIN_STATUSES } = require('../../constants');
const { InvalidSignInTokenError, UserNotFoundError } = require('../errors');
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

      const isValidSignInToken = await this.#signInLinkService.isValidSignInToken({ userId, signInToken });

      if (!isValidSignInToken) {
        throw new InvalidSignInTokenError(userId);
      }

      await this.#signInLinkService.deleteSignInToken(userId);

      const { user, tokenObject } = await this.#signInLinkService.loginUser(userId);

      return res.status(200).json({
        success: true,
        token: tokenObject.token,
        user: sanitizeUser(user),
        loginStatus: LOGIN_STATUSES.VALID_2FA,
        expiresIn: tokenObject.expires,
      });
    } catch (e) {
      console.error(e);

      if (e instanceof UserNotFoundError) {
        return res.status(404).json({
          message: 'Not Found',
          errors: [
            {
              msg: `No user found with id ${req.params.userId}`,
            },
          ],
        });
      }

      if (e instanceof InvalidSignInTokenError || e instanceof UserBlockedError) {
        return res.status(403).send({
          message: 'Forbidden',
          errors: [
            {
              msg: e.message,
            },
          ],
        });
      }

      return res.status(500).send({
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
        return res.status(403).send({
          error: 'Forbidden',
          message: e.message,
        });
      }
      return res.status(500).send({
        error: 'Internal Server Error',
        message: e.message,
      });
    }
  }
}

module.exports = {
  SignInLinkController,
};
