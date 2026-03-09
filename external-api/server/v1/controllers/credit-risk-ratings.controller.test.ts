import axios, { HttpStatusCode } from 'axios';
import * as dotenv from 'dotenv';
import { HEADERS } from '@ukef/dtfs2-common';
import { Request, Response } from 'express';
import httpMocks, { MockRequest, MockResponse } from 'node-mocks-http';
import { findAll } from './credit-risk-ratings.controller';

dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

const mockMdmResponse = [
  {
    id: 5,
    name: 5,
    description: 'A+',
    createdAt: '2026-01-14T14:15:00.943Z',
    updatedAt: '2026-01-14T14:15:00.943Z',
    effectiveFrom: '2026-01-14T14:15:00.943Z',
    effectiveTo: '9999-12-31T00:00:00.000Z',
  },
  {
    id: 24,
    name: 24,
    description: 'C',
    createdAt: '2026-01-14T14:15:00.943Z',
    updatedAt: '2026-01-14T14:15:00.943Z',
    effectiveFrom: '2026-01-14T14:15:00.943Z',
    effectiveTo: '9999-12-31T00:00:00.000Z',
  },
  {
    id: 26,
    name: 26,
    description: 'D',
    createdAt: '2026-01-14T14:15:00.943Z',
    updatedAt: '2026-01-14T14:15:00.943Z',
    effectiveFrom: '2026-01-14T14:15:00.943Z',
    effectiveTo: '9999-12-31T00:00:00.000Z',
  },
];

let mockRequest: MockRequest<Request>;
let mockResponse: MockResponse<Response>;

jest.mock('axios');

describe('findAll', () => {
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
    await findAll(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(2);

    expect(console.error).toHaveBeenNthCalledWith(1, 'Error calling Credit Risk Ratings API, %o', mockError);

    expect(console.error).toHaveBeenNthCalledWith(
      2,
      '🚩 Error occurred during credit risk ratings endpoint call %o',
      expect.objectContaining({ message: 'void response received' }),
    );

    expect(mockResponse._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    expect(mockResponse._getData()).toEqual({ status: HttpStatusCode.InternalServerError, message: 'Error occurred during credit risk ratings endpoint call' });
  });

  it(`should return ${HttpStatusCode.Ok}`, async () => {
    // Arrange
    jest.mocked(axios).mockResolvedValueOnce({
      data: mockMdmResponse,
      status: HttpStatusCode.Ok,
    });

    // Act
    await findAll(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenLastCalledWith({
      method: 'get',
      url: `${APIM_MDM_URL}v2/dom/credit-risk-ratings`,
      headers,
    });

    expect(mockResponse._getStatusCode()).toBe(HttpStatusCode.Ok);
    expect(mockResponse._getData()).toEqual(mockMdmResponse);
  });
});
