require('dotenv').config();
const { createApp } = require('../server/createApp');
const { createApi } = require('./create-api');

describe('api rate limiting', () => {
  const rateLimit = process.env.RATE_LIMIT_THRESHOLD;

  let get;

  beforeEach(() => {
    jest.useFakeTimers();

    const app = createApp();
    get = createApi(app).get;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('for non-static routes', () => {
    const sendRequestTimes = (numberOfRequestsToSend) => Promise.allSettled(Array.from({ length: numberOfRequestsToSend }, () => get('/mandatory-criteria')));

    it('returns a 429 response if more than RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
      await sendRequestTimes(rateLimit);

      const responseAfterRateLimitExceeded = (await sendRequestTimes(1))[0].value;

      expect(responseAfterRateLimitExceeded.status).toBe(429);
    });

    it('returns a successful response if exactly RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
      await sendRequestTimes(rateLimit - 1);

      const responseThatMeetsRateLimit = (await sendRequestTimes(1))[0].value;

      expect(responseThatMeetsRateLimit.status).toBe(302);
    });

    it('returns a successful response if a request is made 1 minute after the endpoint has been rate limited for the same IP to the same endpoint in 1 minute', async () => {
      await sendRequestTimes(rateLimit);

      jest.advanceTimersByTime(60 * 1000);
      const responseAfterRateLimitWindow = (await sendRequestTimes(1))[0].value;

      expect(responseAfterRateLimitWindow.status).toBe(302);
    });
  });

  describe('for static routes', () => {
    const sendRequestTimes = (numberOfRequestsToSend) => Promise.allSettled(Array.from({ length: numberOfRequestsToSend }, () => get('/assets/js/main.js')));

    it('returns a 200 response if more than RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
      await sendRequestTimes(rateLimit);

      const responseAfterRateLimitExceeded = (await sendRequestTimes(1))[0].value;

      expect(responseAfterRateLimitExceeded.status).toBe(200);
    });

    it('returns a 200 response if exactly RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
      await sendRequestTimes(rateLimit - 1);

      const responseThatMeetsRateLimit = (await sendRequestTimes(1))[0].value;

      expect(responseThatMeetsRateLimit.status).toBe(200);
    });

    it('returns a 200 response if a request is made 1 minute after the endpoint has been rate limited for the same IP to the same endpoint in 1 minute', async () => {
      await sendRequestTimes(rateLimit);

      jest.advanceTimersByTime(60 * 1000);
      const responseAfterRateLimitWindow = (await sendRequestTimes(1))[0].value;

      expect(responseAfterRateLimitWindow.status).toBe(200);
    });
  });
});
