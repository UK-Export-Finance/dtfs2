const RateLimit = require('express-rate-limit');
const { apiMaxRequestsInPeriod, apiPeriodInMilliseconds } = require('../../../config/rate-limiter.config');

const rateLimiter = RateLimit({
  windowMs: apiPeriodInMilliseconds,
  max: apiMaxRequestsInPeriod,
  standardHeaders: true,
});

export default rateLimiter;
