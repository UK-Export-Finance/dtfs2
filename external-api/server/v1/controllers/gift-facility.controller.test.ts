import axios, { HttpStatusCode } from 'axios';
import * as dotenv from 'dotenv';
import { HEADERS } from '@ukef/dtfs2-common';
import { Request, Response } from 'express';
import httpMocks, { MockRequest, MockResponse } from 'node-mocks-http';
import { amend, create, get, getMany } from './gift-facility.controller';

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

  describe('when APIM TFS GIFT facility returns success', () => {
    it(`should return ${HttpStatusCode.Ok} with response data`, async () => {
      // Arrange
      const responseData = { facilityId: mockFacilityId, status: 'active' };
      mockRequest.params = { facilityId: mockFacilityId };

      jest.mocked(axios).mockResolvedValueOnce({ status: HttpStatusCode.Ok, data: responseData });

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
      expect(mockResponse._getData()).toEqual(responseData);
    });
  });

  describe('when a APIM TFS GIFT facility is not found', () => {
    it(`should return ${HttpStatusCode.NotFound} with response data`, async () => {
      // Arrange
      const responseData = { message: `Facility ${mockFacilityId} not found` };
      mockRequest.params = { facilityId: mockFacilityId };

      jest.mocked(axios).mockResolvedValueOnce({ status: HttpStatusCode.NotFound, data: responseData });

      // Act
      await get(mockRequest, mockResponse);

      // Assert
      expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.NotFound);
      expect(mockResponse._getData()).toEqual(responseData);
    });
  });

  describe(`when axios throws without an HTTP response`, () => {
    it(`should fallback to ${HttpStatusCode.InternalServerError}`, async () => {
      // Arrange
      const mockResponseBody = {
        message: `Mock response data for get facility ${mockFacilityId}`,
      };

      const mockError = {
        response: {
          data: mockResponseBody,
        },
      };

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
        mockResponseBody,
        mockError,
      );

      expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });
  });

  describe(`when APIM TFS GIFT facility returns an HTTP error response`, () => {
    it(`should forward non-${HttpStatusCode.Ok} and non-${HttpStatusCode.NotFound} status`, async () => {
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

  describe('when ids query parameter is missing', () => {
    it(`should return ${HttpStatusCode.BadRequest}`, async () => {
      // Act
      await getMany(mockRequest, mockResponse);

      // Assert
      expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
      expect(mockResponse._getData()).toEqual({ status: HttpStatusCode.BadRequest, message: 'ids query parameter is required' });
      expect(axios).toHaveBeenCalledTimes(0);
    });
  });

  describe('when APIM TFS returns success', () => {
    it(`should return ${HttpStatusCode.Ok} and response data`, async () => {
      // Arrange
      const facilityIds = ['0000000001', '0000000002'];
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

      expect(axios).toHaveBeenNthCalledWith(1, {
        method: 'GET',
        url: `${APIM_TFS_URL}v2/gift/facilities?ids=${ids}`,
        headers,
      });
    });
  });

  describe('when APIM TFS throws without an HTTP response', () => {
    it(`should fallback to ${HttpStatusCode.InternalServerError}`, async () => {
      // Arrange
      const facilityIds = ['0000000001'];
      const ids = facilityIds.join(',');
      mockRequest.query = { ids };

      const mockResponseBody = {
        message: `Mock response data for get facilities ids=${ids}`,
      };

      const mockError = {
        response: {
          data: mockResponseBody,
        },
      };

      jest.mocked(axios).mockRejectedValueOnce(mockError);

      // Act
      await getMany(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        'Error calling APIM TFS GIFT - get facilities endpoint - ids %s status %s responseBody %o error %o',
        ids,
        HttpStatusCode.InternalServerError,
        mockResponseBody,
        mockError,
      );

      expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      expect(mockResponse._getData()).toEqual(mockResponseBody);
    });
  });

  describe('when APIM TFS get facilities returns an HTTP error response', () => {
    it(`should forward non-${HttpStatusCode.Ok} status`, async () => {
      // Arrange
      const facilityIds = ['0000000001', '0000000002'];
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
      expect(mockResponse._getData()).toEqual(mockAxiosError.response.data);
    });
  });
});

describe('create', () => {
  // Arrange
  const mockApimTfsResponse = {
    data: {},
    status: HttpStatusCode.Accepted,
  };

  beforeEach(() => {
    ({ req: mockRequest, res: mockResponse } = httpMocks.createMocks());

    console.info = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it(`should return ${HttpStatusCode.Accepted} with response data`, async () => {
    // Arrange
    const mockFacilityId = '0000000001';
    const requestBody = {
      overview: {
        facilityId: mockFacilityId,
      },
    };
    const responseData = { facilityId: mockFacilityId };
    mockRequest.body = requestBody;

    jest.mocked(axios).mockResolvedValueOnce({
      ...mockApimTfsResponse,
      data: responseData,
    });

    // Act
    await create(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenNthCalledWith(1, '⚡️ Invoking APIM TFS GIFT - create facility endpoint %s', mockFacilityId);
    expect(console.info).toHaveBeenNthCalledWith(2, '✅ Successfully sent GIFT facility %s creation to APIM TFS', mockFacilityId);

    expect(axios).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      url: `${APIM_TFS_URL}v2/gift/facility`,
      headers,
      data: requestBody,
    });

    expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.Accepted);
    expect(mockResponse._getData()).toEqual(responseData);
  });

  it(`should return ${HttpStatusCode.Created} with response data`, async () => {
    // Arrange
    const mockFacilityId = '0000000002';
    const requestBody = {
      overview: {
        facilityId: mockFacilityId,
      },
    };
    const responseData = { facilityId: mockFacilityId };
    mockRequest.body = requestBody;

    jest.mocked(axios).mockResolvedValueOnce({
      data: responseData,
      status: HttpStatusCode.Created,
    });

    // Act
    await create(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenNthCalledWith(1, '⚡️ Invoking APIM TFS GIFT - create facility endpoint %s', mockFacilityId);
    expect(console.info).toHaveBeenNthCalledWith(2, '✅ Successfully sent GIFT facility %s creation to APIM TFS', mockFacilityId);

    expect(axios).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      url: `${APIM_TFS_URL}v2/gift/facility`,
      headers,
      data: requestBody,
    });

    expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.Created);
    expect(mockResponse._getData()).toEqual(responseData);
  });

  it(`should fallback to ${HttpStatusCode.InternalServerError} when axios throws without an HTTP response`, async () => {
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
    expect(console.info).toHaveBeenNthCalledWith(1, '⚡️ Invoking APIM TFS GIFT - create facility endpoint %s', mockFacilityId);
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

  describe('when APIM TFS GIFT facility returns an HTTP error response', () => {
    it(`should forward non-${HttpStatusCode.Accepted} and non-${HttpStatusCode.Created} status`, async () => {
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
      expect(console.info).toHaveBeenNthCalledWith(1, '⚡️ Invoking APIM TFS GIFT - create facility endpoint %s', mockFacilityId);
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
});

describe('amend', () => {
  const mockFacilityId = 'mock-facility-id';

  beforeEach(() => {
    ({ req: mockRequest, res: mockResponse } = httpMocks.createMocks());

    console.info = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it(`should return ${HttpStatusCode.Accepted} with response data`, async () => {
    // Arrange
    const requestBody = {
      amendmentType: 'ReplaceExpiryDate',
      amendmentData: {
        expiryDate: '2026-12-20',
      },
    };

    mockRequest.params = { facilityId: mockFacilityId };
    mockRequest.body = requestBody;

    jest.mocked(axios).mockResolvedValueOnce({
      status: HttpStatusCode.Accepted,
    });

    // Act
    await amend(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenNthCalledWith(1, '⚡️ Invoking APIM TFS GIFT - amend facility endpoint %s', mockFacilityId);
    expect(console.info).toHaveBeenNthCalledWith(2, '✅ Successfully sent GIFT facility %s amendment to APIM TFS', mockFacilityId);

    expect(axios).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      url: `${APIM_TFS_URL}v2/gift/facility/${mockFacilityId}/amendment`,
      headers,
      data: requestBody,
    });

    expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.Accepted);
    expect(mockResponse._getData()).toEqual({ success: true });
  });

  describe('when axios throws without an HTTP response', () => {
    it(`should fallback to ${HttpStatusCode.InternalServerError}`, async () => {
      // Arrange
      const mockError = new Error('Mock network error');
      const expectedResponseBody = { message: 'No response received from APIM TFS GIFT - amend facility endpoint' };

      jest.mocked(axios).mockRejectedValueOnce(mockError);

      // Act
      mockRequest.params = {
        facilityId: mockFacilityId,
      };

      mockRequest.body = {
        amendmentType: 'ReplaceExpiryDate',
        amendmentData: {
          expiryDate: '2026-12-20',
        },
      };

      await amend(mockRequest, mockResponse);

      // Assert
      expect(console.info).toHaveBeenNthCalledWith(1, '⚡️ Invoking APIM TFS GIFT - amend facility endpoint %s', mockFacilityId);
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        'Error calling APIM TFS GIFT - amend facility endpoint - facilityId %s status %s responseBody %o error %o',
        mockFacilityId,
        HttpStatusCode.InternalServerError,
        expectedResponseBody,
        mockError,
      );

      expect(mockResponse._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });
  });

  describe('when APIM TFS GIFT facility returns an HTTP error response', () => {
    it(`should forward non-${HttpStatusCode.Accepted} status`, async () => {
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

      mockRequest.body = {
        amendmentType: 'ReplaceExpiryDate',
        amendmentData: {
          expiryDate: '2026-12-20',
        },
      };

      await amend(mockRequest, mockResponse);

      // Assert
      expect(console.info).toHaveBeenNthCalledWith(1, '⚡️ Invoking APIM TFS GIFT - amend facility endpoint %s', mockFacilityId);
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        'Error calling APIM TFS GIFT - amend facility endpoint - facilityId %s status %s responseBody %o error %o',
        mockFacilityId,
        mockAxiosError.response.status,
        mockAxiosError.response.data,
        mockAxiosError,
      );

      expect(mockResponse._getStatusCode()).toEqual(mockAxiosError.response.status);
    });
  });
});
