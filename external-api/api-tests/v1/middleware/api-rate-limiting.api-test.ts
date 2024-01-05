import { generateApp } from '../../../src/generateApp';
import { api } from '../../api';

const mockResponse = {
  status: 202,
  data: {
    id: '7b7475ca5c984a808cb56abdc9b75a61',
    statusQueryGetUri:
      'http://localhost:7072/runtime/webhooks/durabletask/instances/7b7475ca5c984a808cb56abdc9b75a61?taskHub=numbergenerator&connection=Storage&code=Xm80X2xSRGxNKd9YtLYDBkynz49/knUL5lI/7KauDj0/duawyQb06A==',
    sendEventPostUri:
      'http://localhost:7072/runtime/webhooks/durabletask/instances/7b7475ca5c984a808cb56abdc9b75a61/raiseEvent/{eventName}?taskHub=numbergenerator&connection=Storage&code=Xm80X2xSRGxNKd9YtLYDBkynz49/knUL5lI/7KauDj0/duawyQb06A==',
    terminatePostUri:
      'http://localhost:7072/runtime/webhooks/durabletask/instances/7b7475ca5c984a808cb56abdc9b75a61/terminate?reason={text}&taskHub=numbergenerator&connection=Storage&code=Xm80X2xSRGxNKd9YtLYDBkynz49/knUL5lI/7KauDj0/duawyQb06A==',
    rewindPostUri:
      'http://localhost:7072/runtime/webhooks/durabletask/instances/7b7475ca5c984a808cb56abdc9b75a61/rewind?reason={text}&taskHub=numbergenerator&connection=Storage&code=Xm80X2xSRGxNKd9YtLYDBkynz49/knUL5lI/7KauDj0/duawyQb06A==',
    purgeHistoryDeleteUri:
      'http://localhost:7072/runtime/webhooks/durabletask/instances/7b7475ca5c984a808cb56abdc9b75a61?taskHub=numbergenerator&connection=Storage&code=Xm80X2xSRGxNKd9YtLYDBkynz49/knUL5lI/7KauDj0/duawyQb06A==',
  },
};

jest.mock('../../../src/v1/controllers/durable-functions-log.controller');

jest.mock('axios', () => jest.fn(() => Promise.resolve(mockResponse)));

describe('api rate limiting', () => {
  const rateLimit = 2;

  const requestBody = {
    dealId: 111,
    dealType: 'dealType',
    entityId: 222,
    entityType: 'deal',
    user: { id: 'userId' },
  };

  let originalRateLimitThreshold: string | undefined;
  let app;
  let post: any;
  let sendRequestTimes: any;

  beforeEach(() => {
    originalRateLimitThreshold = process.env.RATE_LIMIT_THRESHOLD;
    process.env.RATE_LIMIT_THRESHOLD = rateLimit.toString();
    app = generateApp();
    ({ post } = api(app));
    sendRequestTimes = (numberOfRequestsToSend: number) =>
      Promise.allSettled(Array.from({ length: numberOfRequestsToSend }, () => post(requestBody).to('/number-generator')));
  });

  afterEach(() => {
    process.env.RATE_LIMIT_THRESHOLD = originalRateLimitThreshold;
  });

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
