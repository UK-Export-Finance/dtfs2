jest.mock('../../api');

const httpMocks = require('node-mocks-http');
const api = require('../../api');
const { getBankHolidays } = require('.');
const MOCK_BANK_HOLIDAYS = require('../../__mocks__/mock-bank-holidays');

console.error = jest.fn();

describe('get-bank-holidays.controller', () => {
  it('returns bank holidays when the External API request is successful', async () => {
    // Arrange
    api.getBankHolidays.mockResolvedValue(MOCK_BANK_HOLIDAYS);
    const { res, req } = httpMocks.createMocks();

    // Act
    await getBankHolidays(req, res);

    // Assert
    expect(res.statusCode).toEqual(200);
    expect(res._getData()).toEqual(MOCK_BANK_HOLIDAYS);
  });

  it('returns an error response when the External API request fails', async () => {
    // Arrange
    const axiosError = { response: { status: 404 } };
    api.getBankHolidays.mockRejectedValue(axiosError);

    const { res, req } = httpMocks.createMocks();

    // Act
    await getBankHolidays(req, res);

    // Assert
    expect(res.statusCode).toEqual(axiosError.response.status);
    expect(res._getData()).toEqual('Failed to get bank holidays');
  });
});
