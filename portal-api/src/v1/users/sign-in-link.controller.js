const service = require('./sign-in-link.service');

module.exports.createAndEmailSignInLink = async (req, res) => {
  try {
    await service.createAndEmailSignInLink(req.user);
    return res.status(201).send();
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      error: 'Internal Server Error',
      message: e.message
    });
  }
};
