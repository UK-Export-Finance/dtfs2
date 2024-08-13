import dotenv from 'dotenv';
import { Response } from 'supertest';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { testApi } from '../../test-api';

dotenv.config();

const originalProcessEnv = { ...process.env };

describe('api rate limiting', () => {
  const rateLimit = 2;

  beforeEach(async () => {
    if (SqlDbDataSource.isInitialized) {
      await SqlDbDataSource.manager.connection.destroy();
    }

    process.env.RATE_LIMIT_THRESHOLD = rateLimit.toString();
    await testApi.reset();
  });

  afterEach(() => {
    process.env = { ...originalProcessEnv };
  });

  const sendRequestTimes = async (numberOfRequestsToSend: number) => {
    const requests = Array.from({ length: numberOfRequestsToSend }, () => testApi.get('/v1/user'));
    return await Promise.allSettled(requests);
  };

  function assertPromiseIsFulfilled(result: PromiseSettledResult<Response>): asserts result is PromiseFulfilledResult<Response> {
    expect(result.status).toBe('fulfilled');
  }

  it('returns a 429 response if more than RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
    await sendRequestTimes(rateLimit);

    const responseAfterRateLimitExceeded = (await sendRequestTimes(1))[0];

    assertPromiseIsFulfilled(responseAfterRateLimitExceeded);
    expect(responseAfterRateLimitExceeded.value.status).toBe(429);
  });

  it('returns a 200 response if exactly RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
    await sendRequestTimes(rateLimit - 1);

    const responseThatMeetsRateLimit = (await sendRequestTimes(1))[0];

    assertPromiseIsFulfilled(responseThatMeetsRateLimit);
    expect(responseThatMeetsRateLimit.value.status).toBe(200);
  });
});
