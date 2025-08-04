const dotenv = require('dotenv');

dotenv.config();

const { PORTAL_API_KEY } = process.env;

/**
 * Check that the x-api-key header is valid
 * @param {object} req Request object
 * @param {object} res Response object
 * @param {(input?: unknown) => void} next Callback function name
 * @returns {Express.Response} next() or 401 status and error message
 */
const checkApiKey = (req, res, next) => {
  const {
    headers: { 'x-api-key': xApiKey },
  } = req;

  /**
   * x-api-key is not provided.
   * Reject the request.
   */
  if (!xApiKey) {
    return res.status(401).send('Unauthorised');
  }

  /**
   * x-api-key is valid.
   * Allow the request to continue.
   */
  if (xApiKey === PORTAL_API_KEY) {
    return next();
  }

  /**
   * x-api-key is invalid.
   * Reject the request
   */
  return res.status(401).send('Unauthorised');
};

module.exports = checkApiKey;
