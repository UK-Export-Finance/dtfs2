const { InvalidPayloadError, ApiError } = require('@ukef/dtfs2-common');
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
    const { pkceCodes, authCodeRequest, code, state } = req.body;

    const requiredFields = { pkceCodes, authCodeRequest, code, state };
    const missingFields = Object.keys(requiredFields).filter((key) => !requiredFields[key]);

    if (missingFields.length) {
      throw new InvalidPayloadError(`Invalid request, missing fields: ${missingFields.join(', ')}`);
    }

    const loginResult = await authService.processSsoRedirect({ pkceCodes, authCodeRequest, code, state });

    return res.status(200).send(loginResult);
  } catch (err) {
    console.error('Error processing sso login: %O', err);

    if (err instanceof ApiError) {
      return res.status(err.code).send({ data: err.message });
    }

    return res.status(500).send({ data: err.message });
  }
};

exports.getLogoutUrl = (req, res) => res.status(200).send({ logoutUrl: authProvider.getLogoutUrl() });
