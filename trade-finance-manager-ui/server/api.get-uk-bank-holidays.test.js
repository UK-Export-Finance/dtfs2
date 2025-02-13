const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { MOCK_BANK_HOLIDAYS } = require('./test-mocks/mock-bank-holidays');
const { getUkBankHolidays } = require('./api');

const mockAxios = new MockAdapter(axios);

console.error = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
  mockAxios.reset();
});

describe('getUkBankHolidays', () => {
  it('should get the bank holidays', async () => {
    // Arrange
    mockAxios.onGet().reply(200, MOCK_BANK_HOLIDAYS);

    // Act
    const response = await getUkBankHolidays('user-token');

    // Assert
    expect(response).toEqual(MOCK_BANK_HOLIDAYS);
  });

  it('should throw when the TFM API request fails', async () => {
    // Arrange
    mockAxios.onGet().reply(404);

    // Act / Assert
    await expect(getUkBankHolidays('user-token')).rejects.toThrowError('Request failed with status code 404');
  });
});
