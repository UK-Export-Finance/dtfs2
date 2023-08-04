const limiter = require('express-rate-limit');
const InvalidEnvironmentVariableError = require('../../errors/invalid-environment-variable.error');

const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000;

const getRateLimitThresholdFromEnvironmentVariables = () => {
  const { RATE_LIMIT_THRESHOLD } = process.env;
  const rateLimitThresholdPerMinuteAsNumber = Number(RATE_LIMIT_THRESHOLD);

  if (!rateLimitThresholdPerMinuteAsNumber || rateLimitThresholdPerMinuteAsNumber < 0) {
    const invalidRateLimitThresholdValueMessage = `Invalid rate limit threshold value ${RATE_LIMIT_THRESHOLD}.`;
    console.error(invalidRateLimitThresholdValueMessage);
    throw new InvalidEnvironmentVariableError(invalidRateLimitThresholdValueMessage);
  }

  return rateLimitThresholdPerMinuteAsNumber;
};

/**
 * Create global rate-limiter middleware
 */
const createRateLimit = () => {
  const rateLimitThresholdPerMinuteAsNumber = getRateLimitThresholdFromEnvironmentVariables();

  console.info(`Rate-limiting requests to a maximum of ${rateLimitThresholdPerMinuteAsNumber} requests per 1 minute window.`);

  return limiter({
    // The duration of the window to count requests over.
    windowMs: ONE_MINUTE_IN_MILLISECONDS,
    // The maximum number of requests within the window.
    max: rateLimitThresholdPerMinuteAsNumber,
    // Return rate limit info in the `RateLimit-*` headers.
    standardHeaders: true,
    // Return rate limit info in the `X-RateLimit-*` headers.
    legacyHeaders: false,
    // The name of the property on the Express request object to store the rate limit info.
    requestPropertyName: 'threshold',
    // The message to return when the threshold is exceeded.
    message: 'Request threshold reached, please try again later.',
    // Log an error message when the threshold is exceeded.
    handler: (req, res, _next, options) => {
      console.error(`Rate limit threshold exceeded. Returning rate limit error message for request to ${req.originalUrl}.`);
      return res.status(options.statusCode).send(options.message);
    }
  });
};

module.exports = createRateLimit;
