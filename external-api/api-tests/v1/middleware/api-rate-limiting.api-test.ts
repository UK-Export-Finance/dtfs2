/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable import/no-extraneous-dependencies */

import * as dotenv from 'dotenv';
import axios from 'axios';
import { generateApp } from '../../../src/generateApp';
import { api } from '../../api';
import { ENTITY_TYPE, UKEF_ID, USER } from '../../../src/constants';

dotenv.config();

const { RATE_LIMIT_THRESHOLD } = process.env;

const rateLimit = 2;

const body = {
  entityType: ENTITY_TYPE.DEAL,
  dealId: '1234',
};
const mockSuccessfulResponse = {
  status: 200,
  data: [
    {
      id: 12345678,
      maskedId: UKEF_ID.TEST,
      type: 1,
      createdBy: USER.DTFS,
      createdDatetime: '2024-01-01T00:00:00.000Z',
      requestingSystem: USER.DTFS,
    },
  ],
};

axios.post = jest.fn().mockResolvedValue(mockSuccessfulResponse);

describe('api rate limiting', () => {
  let originalRateLimitThreshold: string | undefined;
  let sendRequestTimes: any;

  beforeEach(() => {
    // Initialise environment variable
    originalRateLimitThreshold = RATE_LIMIT_THRESHOLD;
    process.env.RATE_LIMIT_THRESHOLD = rateLimit.toString();

    // Initialise external-api
    const app = generateApp();
    const { post } = api(app);

    sendRequestTimes = (numberOfRequestsToSend: number) =>
      Promise.allSettled(Array.from({ length: numberOfRequestsToSend }, () => post(body).to('/number-generator')));
  });

  afterAll(() => {
    // Set to pre-test value
    process.env.RATE_LIMIT_THRESHOLD = originalRateLimitThreshold;
  });

  it('returns a 429 response if more than RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
    await sendRequestTimes(rateLimit);

    const responseAfterRateLimitExceeded = await sendRequestTimes(1);

    expect(responseAfterRateLimitExceeded[0].value.status).toEqual(429);
  });

  it('returns a 200 response if exactly RATE_LIMIT_THRESHOLD requests are made from the same IP to the same endpoint in 1 minute', async () => {
    await sendRequestTimes(rateLimit - 1);

    const responseThatMeetsRateLimit = await sendRequestTimes(1);

    expect(responseThatMeetsRateLimit[0].value.status).toEqual(200);
  });
});
