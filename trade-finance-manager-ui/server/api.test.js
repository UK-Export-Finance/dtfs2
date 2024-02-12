import api from './api';

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
      it('should return deals data and pagination metadata when TFM API returns this data', async () => {
        const mockResponse = {
          data: {
            deals: [{ id: 1, name: 'Deal 1' }, { id: 2, name: 'Deal 2' }],
            pagination: { totalItems: 2, currentPage: 0, totalPages: 1 },
          },
        };
        axios.mockResolvedValueOnce(mockResponse);

        const queryParams = { page: 0 };
        const token = 'testToken';
        const response = await api.getDeals(queryParams, token);

        expect(axios).toHaveBeenCalledTimes(1);
        expect(axios).toHaveBeenCalledWith({
          method: 'get',
          url: `${TFM_API_URL}/v1/deals`,
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
            'x-api-key': TFM_API_KEY,
          },
          params: queryParams,
        });
        expect(response).toEqual({
          deals: [{ id: 1, name: 'Deal 1' }, { id: 2, name: 'Deal 2' }],
          pagination: { totalItems: 2, currentPage: 0, totalPages: 1 },
        });
      });

      it('should return an empty deals array and pagination metadata with total items and pages equal to 0 when TFM API does not return data', async () => {
        const mockResponse = {};
        axios.mockResolvedValueOnce(mockResponse);

        const queryParams = { page: 1 };
        const token = 'testToken';
        const response = await api.getDeals(queryParams, token);

        expect(axios).toHaveBeenCalledTimes(1);
        expect(axios).toHaveBeenCalledWith({
          method: 'get',
          url: `${TFM_API_URL}/v1/deals`,
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
            'x-api-key': TFM_API_KEY,
          },
          params: queryParams,
        });
        expect(response).toEqual({
          deals: [],
          pagination: { totalItems: 0, currentPage: 1, totalPages: 0 },
        });
      });

      it('should return an empty object when getting the deals from TFM API throws an error', async () => {
        const error = new Error('API Error');
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
        axios.mockRejectedValueOnce(error);

        const queryParams = { page: 0 };
        const token = 'testToken';
        const response = await api.getDeals(queryParams, token);

        expect(axios).toHaveBeenCalledTimes(1);
        expect(axios).toHaveBeenCalledWith({
          method: 'get',
          url: `${TFM_API_URL}/v1/deals`,
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
            'x-api-key': TFM_API_KEY,
          },
          params: queryParams,
        });
        expect(consoleErrorMock).toHaveBeenCalledWith('Unable to get deals %O', error);
        expect(response).toEqual({});
      });

    it('should return an empty object when TFM API returns an unexpected response format', async () => {
      const mockResponse = { data: 'invalidData' };
      axios.mockResolvedValueOnce(mockResponse);

      const queryParams = { page: 0 };
      const token = 'testToken';
      const response = await api.getDeals(queryParams, token);

      expect(axios).toHaveBeenCalledTimes(1);
      expect(axios).toHaveBeenCalledWith({
        method: 'get',
        url: `${TFM_API_URL}/v1/deals`,
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
          'x-api-key': TFM_API_KEY,
        },
        params: queryParams,
      });
      expect(response).toEqual({});
    });

    it('should return undefined for deals data and pagination metadata when TFM API returns empty data', async () => {
      const mockResponse = { data: {} };
      axios.mockResolvedValueOnce(mockResponse);

      const queryParams = { page: 0 };
      const token = 'testToken';
      const response = await api.getDeals(queryParams, token);

      expect(axios).toHaveBeenCalledTimes(1);
      expect(axios).toHaveBeenCalledWith({
        method: 'get',
        url: `${TFM_API_URL}/v1/deals`,
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
          'x-api-key': TFM_API_KEY,
        },
        params: queryParams,
      });
      expect(response).toEqual({
        deals: undefined,
        pagination: undefined,
      });
    });
});
