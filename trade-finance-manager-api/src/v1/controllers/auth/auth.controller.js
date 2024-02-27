const authProvider = require('./auth-provider');
const authService = require('./auth-service');

exports.getLoginUrl = async (req, res) => {
  try {
    const loginInfo = await authProvider.getLoginUrl();
    return res.status(200).send(loginInfo);
  } catch (err) {
    console.error('Error getting login URL: %O', err);
    return res.status(500).send({ data: err.message });
  }
};

exports.processSsoRedirect = async (req, res) => {
  try {
    const loginResult = await authService.processSsoRedirect(req.body.pkceCodes, req.body.authCodeRequest, req);
    return res.status(200).send(loginResult);
  } catch (err) {
    console.error('Error processing sso login: %O', err);
    return res.status(500).send({ data: err.message });
  }
};

exports.getLogoutUrl = (req, res) => res.status(200).send({logoutUrl: authProvider.getLogoutUrl()});
