require('dotenv').config();
const { generateApp } = require('../../../src/generateApp');
const createApi = require('../../api');

// TODO SR-8: set up api test running
describe('api rate limiting', () => {
  const rateLimit = process.env.RATE_LIMIT_THRESHOLD;

  let get;

  beforeEach(() => {
    const app = generateApp();
    get = createApi(app).get;
  });

  const sendRequestTimes = (numberOfRequestsToSend) => Promise.allSettled(Array.from({ length: numberOfRequestsToSend }, () => get('/v1/user')));

  // TODO SR-8: should we check this is not per endpoint? Should we check this is per ip?
  it('returns a 429 response if more than RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
    await sendRequestTimes(rateLimit);

    const responseAfterRateLimitExceeded = (await sendRequestTimes(1))[0].value;

    expect(responseAfterRateLimitExceeded.status).toBe(429);
  });

  it('returns a 200 response if exactly RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
    await sendRequestTimes(rateLimit - 1);

    const responseThatMeetsRateLimit = (await sendRequestTimes(1))[0].value;

    expect(responseThatMeetsRateLimit.status).toBe(200);
  });
});
