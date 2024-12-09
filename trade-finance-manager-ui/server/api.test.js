const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { HEADERS } = require('@ukef/dtfs2-common');
const api = require('./api');
const { MOCK_BANK_HOLIDAYS } = require('./test-mocks/mock-bank-holidays');
const { getUkBankHolidays } = require('./api');
const PageOutOfBoundsError = require('./errors/page-out-of-bounds.error');

const mockAxios = new MockAdapter(axios);

console.error = jest.fn();

const { TFM_API_URL, TFM_API_KEY } = process.env;

afterEach(() => {
  jest.clearAllMocks();
  mockAxios.reset();
});

describe('getDeals()', () => {
  const dealsUrl = `${TFM_API_URL}/v1/deals`;

  const token = 'testToken';
  const headers = {
    Authorization: token,
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    'x-api-key': TFM_API_KEY,
  };

  const mockResponse = {
    deals: [
      { _id: 1, name: 'Deal 1' },
      { _id: 2, name: 'Deal 2' },
    ],
    pagination: { totalItems: 2, currentPage: 0, totalPages: 1 },
  };

  it('should return deals data and pagination metadata when TFM API returns this data', async () => {
    const queryParams = { page: 0 };

    mockAxios
      .onGet(
        dealsUrl,
        { params: queryParams },
        expect.objectContaining(headers), // Axios adds its own headers (e.g., 'Accept'), hence the use of `objectContaining()`
      )
      .reply(200, mockResponse);

    const response = await api.getDeals(queryParams, token);

    expect(mockAxios.history.get.length).toEqual(1);
    expect(response).toEqual({
      deals: [
        { _id: 1, name: 'Deal 1' },
        { _id: 2, name: 'Deal 2' },
      ],
      pagination: { totalItems: 2, currentPage: 0, totalPages: 1 },
    });
  });

  it('should throw a PageOutOfBoundsError when the requested page number exceeds the maximum page number', async () => {
    const queryParams = { page: 1 };

    mockAxios
      .onGet(
        dealsUrl,
        { params: queryParams },
        expect.objectContaining(headers), // Axios adds its own headers (e.g., 'Accept'), hence the use of `objectContaining()`
      )
      .reply(200, mockResponse);

    const errorResponse = api.getDeals(queryParams, token);

    expect(mockAxios.history.get.length).toEqual(1);
    await expect(errorResponse).rejects.toThrow(new PageOutOfBoundsError('Requested page number exceeds the maximum page number'));
  });
});

describe('getFacilities()', () => {
  const facilitiesUrl = `${TFM_API_URL}/v1/facilities`;

  const token = 'testToken';
  const headers = {
    Authorization: token,
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    'x-api-key': TFM_API_KEY,
  };

  const mockResponse = {
    facilities: [
      { facilityId: 1, name: 'Facility 1' },
      { facilityId: 2, name: 'Facility 2' },
    ],
    pagination: { totalItems: 2, currentPage: 0, totalPages: 1 },
  };

  it('should return facilities data and pagination metadata when TFM API returns this data', async () => {
    const queryParams = { page: 0 };

    mockAxios
      .onGet(
        facilitiesUrl,
        { params: queryParams },
        expect.objectContaining(headers), // Axios adds its own headers (e.g., 'Accept'), hence the use of `objectContaining()`
      )
      .reply(200, mockResponse);

    const response = await api.getFacilities(queryParams, token);

    expect(mockAxios.history.get.length).toEqual(1);
    expect(response).toEqual({
      facilities: [
        { facilityId: 1, name: 'Facility 1' },
        { facilityId: 2, name: 'Facility 2' },
      ],
      pagination: { totalItems: 2, currentPage: 0, totalPages: 1 },
    });
  });

  it('should throw a PageOutOfBoundsError when the requested page number exceeds the maximum page number', async () => {
    const queryParams = { page: 1 };

    mockAxios
      .onGet(
        facilitiesUrl,
        { params: queryParams },
        expect.objectContaining(headers), // Axios adds its own headers (e.g., 'Accept'), hence the use of `objectContaining()`
      )
      .reply(200, mockResponse);

    const errorResponse = api.getFacilities(queryParams, token);

    expect(mockAxios.history.get.length).toEqual(1);
    await expect(errorResponse).rejects.toThrow(new PageOutOfBoundsError('Requested page number exceeds the maximum page number'));
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
