import { generateApp } from '../../../src/generateApp';
import { api } from '../../api';

// TODO SR-8: at the moment, even with the timeouts for these tests increased to 10 seconds,
// there is a narrow sweet spot (RATE_LIMIT_THRESHOLD ≈ 20) where RATE_LIMIT_THRESHOLD is
// low enough so that these tests pass within their timeouts, but high enough so that none
// of the other API tests return 429s. This is not ideal, so we should look into overriding
// the RATE_LIMIT_THRESHOLD just for these tests.

describe('api rate limiting', () => {
  const rateLimit = Number(process.env.RATE_LIMIT_THRESHOLD);

  let app;
  let testApi: any;
  let sendRequestTimes: any;

  beforeEach(() => {
    app = generateApp();
    testApi = api(app);
    sendRequestTimes = (numberOfRequestsToSend: number) =>
      Promise.allSettled(Array.from({ length: numberOfRequestsToSend }, () => testApi.post(null).to('/number-generator')));
  });

  it('returns a 429 response if more than RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
    await sendRequestTimes(rateLimit);

    const responseAfterRateLimitExceeded = (await sendRequestTimes(1))[0].value;

    expect(responseAfterRateLimitExceeded.status).toBe(429);
  }, 10000);

  it('returns a 500 response if exactly RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
    await sendRequestTimes(rateLimit - 1);

    const responseThatMeetsRateLimit = (await sendRequestTimes(1))[0].value;

    expect(responseThatMeetsRateLimit.status).toBe(500);
  }, 10000);
});
