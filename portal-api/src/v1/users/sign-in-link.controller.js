class SignInLinkController {
  #signInLinkService;

  constructor(signInLinkService) {
    this.#signInLinkService = signInLinkService;
  }

  async createAndEmailSignInLink(req, res) {
    try {
      await this.#signInLinkService.createAndEmailSignInLink(req.user);
      return res.status(201).send();
    } catch (e) {
      console.error(e);
      return res.status(500).send({
        error: 'Internal Server Error',
        message: e.message
      });
    }
  }
}

module.exports = {
  SignInLinkController
};
