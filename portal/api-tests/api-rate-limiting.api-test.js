require('dotenv').config();
const { generateApp } = require('../server/generateApp');
const { createApi } = require('./create-api');

describe('api rate limiting', () => {
  const rateLimit = 2;

  let originalRateLimitThreshold;
  let get;

  beforeEach(() => {
    originalRateLimitThreshold = process.env.RATE_LIMIT_THRESHOLD;
    process.env.RATE_LIMIT_THRESHOLD = rateLimit.toString();
    const app = generateApp();
    get = createApi(app).get;
  });

  afterEach(() => {
    process.env.RATE_LIMIT_THRESHOLD = originalRateLimitThreshold;
  });

  describe('for non-static routes', () => {
    const sendRequestTimes = (numberOfRequestsToSend) => Promise.allSettled(Array.from({ length: numberOfRequestsToSend }, () => get('/login')));

    it('returns a 429 response if more than RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
      await sendRequestTimes(rateLimit);

      const responseAfterRateLimitExceeded = (await sendRequestTimes(1))[0].value;

      expect(responseAfterRateLimitExceeded.status).toEqual(429);
    });

    it('returns a 200 response if exactly RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
      await sendRequestTimes(rateLimit - 1);

      const responseThatMeetsRateLimit = (await sendRequestTimes(1))[0].value;

      expect(responseThatMeetsRateLimit.status).toEqual(200);
    });
  });

  describe('for static routes', () => {
    const sendRequestTimes = (numberOfRequestsToSend) => Promise.allSettled(Array.from({ length: numberOfRequestsToSend }, () => get('/assets/js/main.js')));

    it('returns a 200 response if more than RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
      await sendRequestTimes(rateLimit);

      const responseAfterRateLimitExceeded = (await sendRequestTimes(1))[0].value;

      expect(responseAfterRateLimitExceeded.status).toEqual(200);
    });

    it('returns a 200 response if exactly RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
      await sendRequestTimes(rateLimit - 1);

      const responseThatMeetsRateLimit = (await sendRequestTimes(1))[0].value;

      expect(responseThatMeetsRateLimit.status).toEqual(200);
    });
  });
});
