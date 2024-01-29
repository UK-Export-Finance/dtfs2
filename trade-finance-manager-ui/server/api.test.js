import api from './api';
import PageOutOfBoundsError from './errors/page-out-of-bounds.error';

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const api = require('./api');
const { MOCK_BANK_HOLIDAYS } = require('./test-mocks/mock-bank-holidays');
const { getUkBankHolidays } = require('./api');

const mockAxios = new MockAdapter(axios);

console.error = jest.fn();

const { TFM_API_URL, TFM_API_KEY } = process.env;

afterEach(() => {
  jest.clearAllMocks();
});

describe('getDeals()', () => {
  const token = 'testToken';

  const baseExpectedArgumentsForAxiosCall = {
    method: 'get',
    url: `${TFM_API_URL}/v1/deals`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
      'x-api-key': TFM_API_KEY,
    },
  };

  it('should return deals data and pagination metadata when TFM API returns this data', async () => {
    const mockResponse = {
      data: {
        deals: [{ _id: 1, name: 'Deal 1' }, { _id: 2, name: 'Deal 2' }],
        pagination: { totalItems: 2, currentPage: 0, totalPages: 1 },
      },
    };
    axios.mockResolvedValueOnce(mockResponse);

    const queryParams = { page: 0 };
    const response = await api.getDeals(queryParams, token);

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledWith({
      ...baseExpectedArgumentsForAxiosCall,
      params: queryParams,
    });
    expect(response).toEqual({
      deals: [{ _id: 1, name: 'Deal 1' }, { _id: 2, name: 'Deal 2' }],
      pagination: { totalItems: 2, currentPage: 0, totalPages: 1 },
    });
  });

  it('should throw a PageOutOfBoundsError when the requested page number exceeds the maximum page number', async () => {
    const mockResponse = {
      data: {
        deals: [{ _id: 1, name: 'Deal 1' }, { _id: 2, name: 'Deal 2' }],
        pagination: { totalItems: 2, currentPage: 0, totalPages: 1 },
      },
    };
    axios.mockResolvedValueOnce(mockResponse);

    const queryParams = { page: 1 };
    const errorResponse = api.getDeals(queryParams, token);

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledWith({
      ...baseExpectedArgumentsForAxiosCall,
      params: queryParams,
    });
    await expect(errorResponse)
      .rejects
      .toThrow(new PageOutOfBoundsError('Requested page number exceeds the maximum page number'));
  });
});

describe('getFacilities()', () => {
  const token = 'testToken';

  const baseExpectedArgumentsForAxiosCall = {
    method: 'get',
    url: `${TFM_API_URL}/v1/facilities`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
      'x-api-key': TFM_API_KEY,
    },
  };

  it('should return facilities data and pagination metadata when TFM API returns this data', async () => {
    const mockResponse = {
      data: {
        facilities: [{ facilityId: 1, name: 'Facility 1' }, { facilityId: 2, name: 'Facility 2' }],
        pagination: { totalItems: 2, currentPage: 0, totalPages: 1 },
      },
    };
    axios.mockResolvedValueOnce(mockResponse);

    const queryParams = { page: 0 };
    const response = await api.getFacilities(queryParams, token);

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledWith({
      ...baseExpectedArgumentsForAxiosCall,
      params: queryParams,
    });
    expect(response).toEqual({
      facilities: [{ facilityId: 1, name: 'Facility 1' }, { facilityId: 2, name: 'Facility 2' }],
      pagination: { totalItems: 2, currentPage: 0, totalPages: 1 },
    });
  });

  it('should throw a PageOutOfBoundsError when the requested page number exceeds the maximum page number', async () => {
    const mockResponse = {
      data: {
        facilities: [{ facilityId: 1, name: 'Facility 1' }, { facilityId: 2, name: 'Facility 2' }],
        pagination: { totalItems: 2, currentPage: 0, totalPages: 1 },
      },
    };
    axios.mockResolvedValueOnce(mockResponse);

    const queryParams = { page: 1 };
    const errorResponse = api.getFacilities(queryParams, token);

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledWith({
      ...baseExpectedArgumentsForAxiosCall,
      params: queryParams,
    });
    await expect(errorResponse)
      .rejects
      .toThrow(new PageOutOfBoundsError('Requested page number exceeds the maximum page number'));
  });
});

describe('getUkBankHolidays', () => {
  it('gets the bank holidays', async () => {
    // Arrange
    mockAxios.onGet().reply(200, MOCK_BANK_HOLIDAYS);

    // Act
    const response = await getUkBankHolidays('user-token');

    // Assert
    expect(response).toEqual(MOCK_BANK_HOLIDAYS);
  });

  it('throws when the api TFM API request fails', async () => {
    // Arrange
    mockAxios.onGet().reply(404);

    // Act / Assert
    await expect(getUkBankHolidays('user-token')).rejects.toThrowError('Request failed with status code 404');
  });
});
