import axios, { HttpStatusCode } from 'axios';
import * as dotenv from 'dotenv';
import { HEADERS } from '@ukef/dtfs2-common';
import { Request, Response } from 'express';
import httpMocks, { MockRequest, MockResponse } from 'node-mocks-http';
import { create, get, getMany } from './gift-facility.controller';

dotenv.config();

const { APIM_TFS_VALUE, APIM_TFS_KEY, APIM_TFS_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_TFS_KEY)]: APIM_TFS_VALUE,
};

let mockRequest: MockRequest<Request>;
let mockResponse: MockResponse<Response>;

jest.mock('axios');

describe('get', () => {
  // Arrange
  const mockFacilityId = 'mock-facility-id';

  beforeEach(() => {
    ({ req: mockRequest, res: mockResponse } = httpMocks.createMocks());

    console.info = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it(`should return ${HttpStatusCode.Ok} when APIM TFS GIFT facility returns success`, async () => {
    // Arrange
    mockRequest.params = { facilityId: mockFacilityId };

    jest.mocked(axios).mockResolvedValueOnce({ status: HttpStatusCode.Ok, data: {} });

    // Act
    await get(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);

    expect(axios).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: `${APIM_TFS_URL}v2/gift/facility/${mockFacilityId}`,
      headers,
    });

    expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.Ok);
  });

  it(`should fallback to ${HttpStatusCode.InternalServerError} when axios throws without an HTTP response`, async () => {
    // Arrange
    const mockError = new Error('Mock network error');

    const expectedResponseBody = { message: `No response received from APIM TFS GIFT - get facility ${mockFacilityId} endpoint` };

    jest.mocked(axios).mockRejectedValueOnce(mockError);

    // Act
    mockRequest.params = {
      facilityId: mockFacilityId,
    };

    await get(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      'Error calling APIM TFS GIFT - get facility endpoint - facilityId %s status %s responseBody %o error %o',
      mockFacilityId,
      HttpStatusCode.InternalServerError,
      expectedResponseBody,
      mockError,
    );

    expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
  });

  it(`should forward non-${HttpStatusCode.Ok} and non-${HttpStatusCode.NotFound} status when APIM TFS GIFT facility returns an HTTP error response`, async () => {
    // Arrange
    const mockAxiosError = {
      response: {
        status: HttpStatusCode.BadGateway,
        data: {
          status: HttpStatusCode.BadGateway,
          message: 'Mock upstream error',
          errors: [{ code: 'UPSTREAM_FAILURE' }],
        },
      },
    };

    jest.mocked(axios).mockRejectedValueOnce(mockAxiosError);

    // Act
    mockRequest.params = {
      facilityId: mockFacilityId,
    };

    await get(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      'Error calling APIM TFS GIFT - get facility endpoint - facilityId %s status %s responseBody %o error %o',
      mockFacilityId,
      mockAxiosError.response.status,
      mockAxiosError.response.data,
      mockAxiosError,
    );

    expect(mockResponse._getStatusCode()).toEqual(mockAxiosError.response.status);
  });
});

describe('getMany', () => {
  beforeEach(() => {
    ({ req: mockRequest, res: mockResponse } = httpMocks.createMocks());

    console.info = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it(`should return ${HttpStatusCode.BadRequest} when ids query parameter is missing`, async () => {
    // Act
    await getMany(mockRequest, mockResponse);

    // Assert
    expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(mockResponse._getData()).toEqual({ status: HttpStatusCode.BadRequest, message: 'ids query parameter is required' });
    expect(axios).toHaveBeenCalledTimes(0);
  });

  it(`should return ${HttpStatusCode.Ok} and response data when APIM TFS returns success`, async () => {
    // Arrange
    const facilityIds = ['FACILITY-001', 'FACILITY-002'];
    const ids = facilityIds.join(',');
    const mockResponseData = {
      facilities: [
        { facilityId: facilityIds[0], status: HttpStatusCode.Ok },
        { facilityId: facilityIds[1], status: HttpStatusCode.NotFound },
      ],
    };

    mockRequest.query = { ids };

    jest.mocked(axios).mockResolvedValueOnce({ status: HttpStatusCode.Ok, data: mockResponseData });

    // Act
    await getMany(mockRequest, mockResponse);

    // Assert
    expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(mockResponse._getData()).toEqual(mockResponseData);

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledWith({
      method: 'GET',
      url: `${APIM_TFS_URL}v2/gift/facilities?ids=${ids}`,
      headers,
    });
  });

  it(`should fallback to ${HttpStatusCode.InternalServerError} when APIM TFS throws without an HTTP response`, async () => {
    // Arrange
    const facilityIds = ['FACILITY-001'];
    const ids = facilityIds.join(',');
    mockRequest.query = { ids };

    const mockError = new Error('Mock network error');
    jest.mocked(axios).mockRejectedValueOnce(mockError);

    // Act
    await getMany(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      'Error calling APIM TFS GIFT - get facilities endpoint - ids %s status %s responseBody %o error %o',
      ids,
      HttpStatusCode.InternalServerError,
      { message: `No response received from APIM TFS GIFT - get facilities endpoint ids=${ids}` },
      mockError,
    );

    expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
  });

  it(`should forward non-${HttpStatusCode.Ok} status when APIM TFS get facilities returns an HTTP error response`, async () => {
    // Arrange
    const facilityIds = ['FACILITY-001', 'FACILITY-002'];
    const ids = facilityIds.join(',');
    mockRequest.query = { ids };

    const mockAxiosError = {
      response: {
        status: HttpStatusCode.BadGateway,
        data: {
          status: HttpStatusCode.BadGateway,
          message: 'Mock upstream error',
          errors: [{ code: 'UPSTREAM_FAILURE' }],
        },
      },
    };

    jest.mocked(axios).mockRejectedValueOnce(mockAxiosError);

    // Act
    await getMany(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      'Error calling APIM TFS GIFT - get facilities endpoint - ids %s status %s responseBody %o error %o',
      ids,
      mockAxiosError.response.status,
      mockAxiosError.response.data,
      mockAxiosError,
    );

    expect(mockResponse._getStatusCode()).toEqual(mockAxiosError.response.status);
  });
});

describe('create', () => {
  // Arrange
  const mockTfsResponse = {
    data: {},
    status: HttpStatusCode.Created,
  };

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
      method: 'POST',
      url: `${APIM_TFS_URL}v2/gift/facility`,
      headers,
      data: requestBody,
    });

    expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.Created);
  });

  it('should fallback to 500 when axios throws without an HTTP response', async () => {
    // Arrange
    const mockError = new Error('Mock network error');
    const mockFacilityId = 'mock-facility-id';
    const expectedResponseBody = { message: 'No response received from APIM TFS GIFT - create facility endpoint' };

    jest.mocked(axios).mockRejectedValueOnce(mockError);

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
      'Error calling APIM TFS GIFT - create facility endpoint - facilityId %s status %s responseBody %o error %o',
      mockFacilityId,
      HttpStatusCode.InternalServerError,
      expectedResponseBody,
      mockError,
    );

    expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
  });

  it(`should forward non-${HttpStatusCode.Created} status when APIM TFS GIFT facility returns an HTTP error response`, async () => {
    // Arrange
    const mockFacilityId = 'mock-facility-id';
    const mockAxiosError = {
      response: {
        status: HttpStatusCode.BadGateway,
        data: {
          status: HttpStatusCode.BadGateway,
          message: 'Mock upstream error',
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
      'Error calling APIM TFS GIFT - create facility endpoint - facilityId %s status %s responseBody %o error %o',
      mockFacilityId,
      mockAxiosError.response.status,
      mockAxiosError.response.data,
      mockAxiosError,
    );

    expect(mockResponse._getStatusCode()).toEqual(mockAxiosError.response.status);
  });
});
