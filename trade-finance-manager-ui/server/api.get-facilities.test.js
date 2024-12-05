const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { HEADERS } = require('@ukef/dtfs2-common');
const api = require('./api');
const PageOutOfBoundsError = require('./errors/page-out-of-bounds.error');

const mockAxios = new MockAdapter(axios);

console.error = jest.fn();

const { TFM_API_URL, TFM_API_KEY } = process.env;

afterEach(() => {
  jest.clearAllMocks();
  mockAxios.reset();
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
