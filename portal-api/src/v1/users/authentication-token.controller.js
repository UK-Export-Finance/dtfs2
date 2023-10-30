const service = require('./authentication-token.service');

module.exports.createAndSendAuthenticationToken = async (req, res) => {
  try {
    await service.createAndSendAuthenticationToken(req.user);
    return res.status(201).send();
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      error: 'Internal Server Error',
      message: e.message
    });
  }
};
