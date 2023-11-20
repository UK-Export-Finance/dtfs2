const { LOGIN_STATUSES } = require('../../constants');
const utils = require('../../crypto/utils');
const { InvalidSignInTokenError } = require('../errors');
const { updateLastLogin } = require('./controller');
const { sanitizeUser } = require('./sanitizeUserData');

class SignInLinkController {
  #signInLinkService;

  constructor(signInLinkService) {
    this.#signInLinkService = signInLinkService;
  }

  async loginWithSignInLink(req, res) {
    try {
      const {
        params: { signInToken },
        user,
      } = req;

      const isValidSignInToken = await this.#signInLinkService.isValidSignInToken({ userId: user._id, signInToken });

      if (!isValidSignInToken) {
        throw new InvalidSignInTokenError(user._id);
      }

      await this.#signInLinkService.deleteSignInToken(user._id);

      const { sessionIdentifier, ...tokenObject } = utils.issueValid2faJWT(user);
      await updateLastLogin(user, sessionIdentifier);

      return res.status(200).json({
        success: true,
        token: tokenObject.token,
        user: sanitizeUser(user),
        loginStatus: LOGIN_STATUSES.VALID_2FA,
        expiresIn: tokenObject.expires,
      });
    } catch (e) {
      console.error(e);

      if (e instanceof InvalidSignInTokenError) {
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

  async createAndEmailSignInLink(req, res) {
    try {
      await this.#signInLinkService.createAndEmailSignInLink(req.user);
      return res.status(201).send();
    } catch (e) {
      console.error(e);
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
