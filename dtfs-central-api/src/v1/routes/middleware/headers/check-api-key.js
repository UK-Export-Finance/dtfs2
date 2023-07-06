const dotenv = require('dotenv');

dotenv.config();

const { CENTRAL_API_KEY } = process.env;

/**
 * Check that the x-api-key header is valid
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {String} next Callback function name
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
  if (xApiKey === API_KEY) {
    return next();
  }

  /**
   * x-api-key is invalid.
   * Reject the reuqest
   */
  return res.status(401).send('Unauthorised');
};

module.exports = checkApiKey;
