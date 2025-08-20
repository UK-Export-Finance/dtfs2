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
import dotenv from 'dotenv';
import axios, { HttpStatusCode } from 'axios';
import { createRequest, createResponse } from 'node-mocks-http';
import { nowZeroSeconds, USER, NUMBER_TYPE, ENTITY_TYPE, UKEF_ID } from '@ukef/dtfs2-common';
import { getNumber } from '../../src/v1/controllers/number-generator.controller';
import { InvalidEntityTypeError } from '../../src/v1/errors';

dotenv.config();

const originalProcessEnv = { ...process.env };

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
      type: NUMBER_TYPE.DEAL,
      createdBy: USER.DTFS,
      createdDatetime: '2024-01-01T00:00:00.000Z',
      requestingSystem: USER.DTFS,
    },
  ],
};

/**
 * This code snippet demonstrates the usage of the `get` function from the `number-generator.controller` module.
 * The `get` function is responsible for retrieving a number from the number generator API based on the provided entityType and dealId.
 * It makes use of the `axios` library to send a POST request to the API and handles the response accordingly.
 * The function also handles various error scenarios, such as when the entityType is invalid or when the number generator response is void.
 * The code snippet includes test cases that validate the behavior of the `get` function in different scenarios.
 */
describe('getNumber', () => {
  beforeEach(() => {
    process.env = { ...originalProcessEnv };
    process.env.NUMBER_GENERATOR = 'abc';
    process.env.MOCK_E2E_NUMBER_GENERATOR = 'def';
  });

  afterAll(() => {
    process.env = { ...originalProcessEnv };
  });

  it('should retrieve a number from the number generator API when valid entityType and dealId are provided', async () => {
    process.env.NUMBER_GENERATOR = 'abc';
    process.env.MOCK_E2E_NUMBER_GENERATOR = 'def';

    const request = createRequest({ body });
    const response = createResponse();
    const result = await getNumber(request, response);

    expect(result).not.toBeNull();
    expect(result.statusCode).toEqual(200);
  });

  it('should generate a number for a deal with valid entityType and dealId', async () => {
    process.env.NUMBER_GENERATOR = 'abc';
    process.env.MOCK_E2E_NUMBER_GENERATOR = 'def';

    // Mock request and response objects
    const request: any = {
      body,
    };
    const response: any = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock axios.post method
    axios.post = jest.fn().mockResolvedValue(mockSuccessfulResponse);

    // Call the get function
    await getNumber(request, response);

    // Assertions
    expect(response.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
    expect(response.send).toHaveBeenCalledWith({
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
    });
  });

  describe('when NUMBER_GENERATOR is set to MOCK_E2E_NUMBER_GENERATOR', () => {
    beforeEach(() => {
      process.env.NUMBER_GENERATOR = 'abc';
      process.env.MOCK_E2E_NUMBER_GENERATOR = 'abc';
    });

    it('should return mocked response', async () => {
      process.env.NUMBER_GENERATOR = 'abc';
      process.env.MOCK_E2E_NUMBER_GENERATOR = 'abc';

      // Mock request and response objects
      const request: any = {
        body,
      };
      const response: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      // Call the get function
      await getNumber(request, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatusCode.Ok);

      expect(response.send).toHaveBeenCalledWith({
        status: HttpStatusCode.Created,
        data: [
          {
            id: expect.any(Number),
            maskedId: expect.any(String),
            type: 1,
            createdBy: USER.DTFS,
            createdDatetime: new Date(nowZeroSeconds()).toISOString(),
            requestingSystem: USER.DTFS,
          },
        ],
      });
    });
  });

  describe('when MOCK_E2E_NUMBER_GENERATOR is undefined', () => {
    it(`should return ${HttpStatusCode.Created} response`, async () => {
      process.env.MOCK_E2E_NUMBER_GENERATOR = undefined;

      // Mock request and response objects
      const request: any = {
        body,
      };
      const response: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      // Mock axios.post method
      axios.post = jest.fn().mockResolvedValue(mockSuccessfulResponse);

      // Call the get function
      await getNumber(request, response);

      // Assertions
      expect(response.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
      expect(response.send).toHaveBeenCalledWith({
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
      });
    });
  });

  describe('when MOCK_E2E_GOV_NOTIFY_API_KEY is an empty string', () => {
    it(`should return ${HttpStatusCode.Created} response`, async () => {
      process.env.MOCK_E2E_NUMBER_GENERATOR = '';

      // Mock request and response objects
      const request: any = {
        body,
      };
      const response: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      // Mock axios.post method
      axios.post = jest.fn().mockResolvedValue(mockSuccessfulResponse);

      // Call the get function
      await getNumber(request, response);

      // Assertions
      expect(response.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
      expect(response.send).toHaveBeenCalledWith({
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
      });
    });
  });

  it('should throw an error when entityType is not valid', async () => {
    process.env.NUMBER_GENERATOR = 'abc';
    process.env.MOCK_E2E_NUMBER_GENERATOR = 'def';

    // Mock request and response objects
    const request: any = {
      body: {
        entityType: 'invalid',
        dealId: '12345',
      },
    };
    const response: any = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Call the get function
    await getNumber(request, response);

    // Assertions
    expect(response.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
    expect(response.send).toHaveBeenCalledWith({
      status: HttpStatusCode.BadRequest,
      error: new InvalidEntityTypeError('invalid'),
    });
  });

  it('should throw an error when number generator response is void', async () => {
    process.env.NUMBER_GENERATOR = 'abc';
    process.env.MOCK_E2E_NUMBER_GENERATOR = 'def';

    // Mock request and response objects
    const request: any = {
      body,
    };
    const response: any = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock axios.post method
    axios.post = jest.fn().mockResolvedValue({
      status: 200,
      data: null,
    });

    // Call the get function
    await getNumber(request, response);

    // Assertions
    expect(response.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
    expect(response.send).toHaveBeenCalledWith({
      status: HttpStatusCode.InternalServerError,
      error: {
        cause: 'Invalid number generator response received for deal 1234',
      },
    });
  });
});
