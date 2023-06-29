const dotenv = require('dotenv');

dotenv.config();

const { API_KEY } = process.env;

/**
 * checkApiKey
 * checks x-api-key header matches set API_KEY
 * returns next() or 401 status
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Express.Response} next
 * @returns {Express.Response} next() or 401 status and error message
 */
const checkApiKey = (req, res, next) => {
  const {
    headers: { 'x-api-key': xApiKey },
  } = req;

  // if header x-api-key matches API_KEY, then should redirect
  if (xApiKey === API_KEY) {
    return next();
  }

  return res.status(401).send({ status: 401, message: 'Unauthorized' });
};

module.exports = checkApiKey;
