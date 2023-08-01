const limiter = require('express-rate-limit');

const { RATE_LIMIT_THRESHOLD } = process.env;

/**
 * Global rate-limiter middleware
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const rateLimit = (req, res) => {
  if (!Number(RATE_LIMIT_THRESHOLD) && Number(RATE_LIMIT_THRESHOLD) > 0) {
    console.error('Invalid rate limit threshold value %s', RATE_LIMIT_THRESHOLD);
    return res.redirect('/not-found');
  }

  return limiter({
    // 1 minutes
    windowMs: 1 * 60 * 1000,
    // Threshold limit, x requests per windowMs (60 seconds)
    max: Number(RATE_LIMIT_THRESHOLD),
    // Return rate limit info in the `RateLimit-*` headers
    standardHeaders: true,
    // Send the `X-RateLimit-*` headers
    legacyHeaders: false,
    // The name of the property on the Express request object to store the rate limit info.
    requestPropertyName: 'threshold',
    // Threshold reached message
    message: 'Request threshold reached, please try again later.',
  });
};

module.exports = rateLimit;
