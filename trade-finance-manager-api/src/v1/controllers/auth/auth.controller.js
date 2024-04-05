const authProvider = require('./auth-provider.js');
const authService = require('./auth-service');

exports.getLoginUrl = async (_req, res) => {
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
    const { pkceCodes, authCodeRequest, code, state } = req.body;

    const loginResult = await authService.processSsoRedirect({ pkceCodes, authCodeRequest, code, state });

    return res.status(200).send(loginResult);
  } catch (err) {
    console.error('Error processing sso login: %O', err);

    return res.status(500).json({ data: err.message });
  }
};

exports.getLogoutUrl = (_req, res) => res.status(200).send({logoutUrl: authProvider.getLogoutUrl()});
