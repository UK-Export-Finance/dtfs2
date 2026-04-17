import axios, { HttpStatusCode } from 'axios';
import * as dotenv from 'dotenv';
import { HEADERS } from '@ukef/dtfs2-common';
import { Request, Response } from 'express';
import httpMocks, { MockRequest, MockResponse } from 'node-mocks-http';
import { create } from './gift-facility.controller';

dotenv.config();

const { APIM_TFS_VALUE, APIM_TFS_KEY, APIM_TFS_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_TFS_KEY)]: APIM_TFS_VALUE,
};

const mockTfsResponse = {
  data: {},
  status: HttpStatusCode.Created,
};

let mockRequest: MockRequest<Request>;
let mockResponse: MockResponse<Response>;

jest.mock('axios');

describe('create', () => {
  beforeEach(() => {
    ({ req: mockRequest, res: mockResponse } = httpMocks.createMocks());

    console.info = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it(`should return ${HttpStatusCode.InternalServerError} when an error is thrown`, async () => {
    // Arrange
    const mockError = new Error('Mock error');

    jest.mocked(axios).mockRejectedValueOnce(mockError);

    // Act
    await create(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(2);

    expect(console.error).toHaveBeenNthCalledWith(1, 'Error calling APIM TFS GIFT facility endpoint, %o', mockError);

    expect(console.error).toHaveBeenNthCalledWith(
      2,
      '🚩 Error occurred during GIFT facility endpoint call %o',
      expect.objectContaining({ message: 'void response received' }),
    );

    expect(mockResponse._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    expect(mockResponse._getData()).toEqual({ status: HttpStatusCode.InternalServerError, message: 'Error occurred during GIFT facility endpoint call' });
  });

  it(`should forward non-${HttpStatusCode.Ok} status and body when APIM TFS GIFT facility returns an HTTP error response`, async () => {
    // Arrange
    const mockAxiosError = {
      response: {
        status: HttpStatusCode.BadGateway,
        data: {
          status: HttpStatusCode.BadGateway,
          message: 'TFS upstream error',
          errors: [{ code: 'UPSTREAM_FAILURE' }],
        },
      },
    };

    jest.mocked(axios).mockRejectedValueOnce(mockAxiosError);

    // Act
    await create(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error calling APIM TFS GIFT facility endpoint, %o', mockAxiosError);

    expect(mockResponse._getStatusCode()).toBe(mockAxiosError.response.status);
    expect(mockResponse._getData()).toEqual(mockAxiosError.response.data);
  });

  it(`should return ${HttpStatusCode.Created}`, async () => {
    // Arrange
    jest.mocked(axios).mockResolvedValueOnce({
      data: mockTfsResponse,
      status: HttpStatusCode.Created,
    });

    // Act
    await create(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenLastCalledWith({
      method: 'post',
      url: `${APIM_TFS_URL}v2/gift/facility`,
      headers,
    });

    expect(mockResponse._getStatusCode()).toBe(HttpStatusCode.Created);
    expect(mockResponse._getData()).toEqual(mockTfsResponse);
  });
});
