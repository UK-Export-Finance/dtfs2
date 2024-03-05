import api from './api';
import PageOutOfBoundsError from './errors/page-out-of-bounds.error';

const axios = require('axios');

jest.mock('axios');

const { TFM_API_URL, TFM_API_KEY } = process.env;

afterEach(() => {
  jest.clearAllMocks();
});

describe('getFacilities()', () => {
  it('returns the correct response', async () => {
    axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getFacilities();
    expect(response).toEqual({ facilities: [] });
  });
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
        deals: [{ id: 1, name: 'Deal 1' }, { id: 2, name: 'Deal 2' }],
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
      deals: [{ id: 1, name: 'Deal 1' }, { id: 2, name: 'Deal 2' }],
      pagination: { totalItems: 2, currentPage: 0, totalPages: 1 },
    });
  });

  it('should throw a PageOutOfBoundsError when the requested page number exceeds the maximum page number', async () => {
    const mockResponse = {
      data: {
        deals: [{ id: 1, name: 'Deal 1' }, { id: 2, name: 'Deal 2' }],
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
