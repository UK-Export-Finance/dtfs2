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

  it(`should return ${HttpStatusCode.Created} without response data`, async () => {
    // Arrange
    const requestBody = { test: true };
    mockRequest.body = requestBody;

    jest.mocked(axios).mockResolvedValueOnce(mockTfsResponse);

    // Act
    await create(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);

    expect(axios).toHaveBeenNthCalledWith(1, {
      method: 'post',
      url: `${APIM_TFS_URL}v2/gift/facility`,
      headers,
      data: requestBody,
    });

    expect(mockResponse._getStatusCode()).toBe(HttpStatusCode.Created);
  });

  it('should return a concrete error status when axios throws with an HTTP error response', async () => {
    // Arrange
    const mockError = {
      response: {
        status: HttpStatusCode.InternalServerError,
        data: {
          status: HttpStatusCode.InternalServerError,
          message: 'Mock upstream error',
          errors: [{ code: 'MOCK_FAILURE' }],
        },
      },
    };
    const mockFacilityId = 'mock-facility-id';

    jest.mocked(axios).mockRejectedValueOnce(mockError);

    // Act
    const mockRequestWithParams = httpMocks.createRequest({
      method: 'POST',
      body: {
        overview: {
          facilityId: mockFacilityId,
        },
      },
    });

    await create(mockRequestWithParams, mockResponse);

    // Assert
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      'Error calling APIM TFS GIFT facility endpoint - facilityId %s status %s responseBody %o error %o',
      mockFacilityId,
      mockError.response.status,
      mockError.response.data,
      mockError,
    );

    expect(mockResponse._getStatusCode()).toBe(HttpStatusCode.InternalServerError); // Set a default status
  });

  it(`should forward non-${HttpStatusCode.Created} status when APIM TFS GIFT facility returns an HTTP error response`, async () => {
    // Arrange
    const mockFacilityId = 'mock-facility-id';
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
    mockRequest.body = {
      overview: {
        facilityId: mockFacilityId,
      },
    };

    await create(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      'Error calling APIM TFS GIFT facility endpoint - facilityId %s status %s responseBody %o error %o',
      mockFacilityId,
      mockAxiosError.response.status,
      mockAxiosError.response.data,
      mockAxiosError,
    );

    expect(mockResponse._getStatusCode()).toBe(mockAxiosError.response.status);
  });
});
