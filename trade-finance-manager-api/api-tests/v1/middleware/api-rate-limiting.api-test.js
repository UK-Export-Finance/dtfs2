require('dotenv').config();
const { generateApp } = require('../../../src/generateApp');
const { createApi } = require('../../api');

describe('api rate limiting', () => {
  const rateLimit = 2;

  let originalRateLimitThreshold;
  let as;
  let sendRequestTimes;

  beforeEach(() => {
    originalRateLimitThreshold = process.env.RATE_LIMIT_THRESHOLD;
    process.env.RATE_LIMIT_THRESHOLD = rateLimit.toString();
    const app = generateApp();
    ({ as } = createApi(app));
    sendRequestTimes = (numberOfRequestsToSend) =>
      Promise.allSettled(Array.from({ length: numberOfRequestsToSend }, () => as(null).put(null).to('/v1/deals/submit')));
  });

  afterEach(() => {
    process.env.RATE_LIMIT_THRESHOLD = originalRateLimitThreshold;
  });

  it('returns a 429 response if more than RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
    await sendRequestTimes(rateLimit);

    const responseAfterRateLimitExceeded = (await sendRequestTimes(1))[0].value;

    expect(responseAfterRateLimitExceeded.status).toEqual(429);
  });

  it('returns a 400 response if exactly RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
    await sendRequestTimes(rateLimit - 1);

    const responseThatMeetsRateLimit = (await sendRequestTimes(1))[0].value;

    expect(responseThatMeetsRateLimit.status).toEqual(400);
  });
});
