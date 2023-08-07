require('dotenv').config();
const { generateApp } = require('../../../src/generateApp');
const createApi = require('../../api');

describe('api rate limiting', () => {
  const rateLimit = process.env.RATE_LIMIT_THRESHOLD;

  let app;
  let as;
  let sendRequestTimes;

  beforeEach(() => {
    jest.useFakeTimers();

    app = generateApp();
    ({ as } = createApi(app));
    sendRequestTimes = (numberOfRequestsToSend) => Promise.allSettled(Array.from({ length: numberOfRequestsToSend }, () => as(null).get('/v1/mandatory-criteria')));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns a 429 response if more than RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
    await sendRequestTimes(rateLimit);

    const responseAfterRateLimitExceeded = (await sendRequestTimes(1))[0].value;

    expect(responseAfterRateLimitExceeded.status).toBe(429);
  });

  it('returns a 401 response if exactly RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
    await sendRequestTimes(rateLimit - 1);

    const responseThatMeetsRateLimit = (await sendRequestTimes(1))[0].value;

    expect(responseThatMeetsRateLimit.status).toBe(401);
  });

  it('returns a 401 response if a request is made 1 minute after the endpoint has been rate limited for the same IP to the same endpoint in 1 minute', async () => {
    await sendRequestTimes(rateLimit);

    jest.advanceTimersByTime(60 * 1000);
    const responseAfterRateLimitWindow = (await sendRequestTimes(1))[0].value;

    expect(responseAfterRateLimitWindow.status).toBe(401);
  });
});
