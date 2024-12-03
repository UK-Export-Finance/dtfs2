const httpMocks = require('node-mocks-http');
const validateBankIdForUser = require('.');
const MOCK_BANKS = require('../../../../test-helpers/mock-banks');

describe('validateBankIdForUser', () => {
  it(`redirects to '/not-found' if the user bank and bankId param do not match`, () => {
    // Arrange
    const usersBankId = MOCK_BANKS.BARCLAYS.id;
    const otherBankId = MOCK_BANKS.HSBC.id;

    const { res: mockRes, req: mockReq } = httpMocks.createMocks({
      session: { user: { bank: { id: usersBankId } } },
      params: { bankId: otherBankId },
    });

    const mockNext = jest.fn();

    // Act
    validateBankIdForUser(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).not.toHaveBeenCalled();
    // eslint-disable-next-line no-underscore-dangle
    expect(mockRes._getRedirectUrl()).toBe('/not-found');
  });

  it('calls the next middleware function if the user bank and bankId param match', () => {
    // Arrange
    const usersBankId = MOCK_BANKS.BARCLAYS.id;

    const { res: mockRes, req: mockReq } = httpMocks.createMocks({
      session: { user: { bank: { id: usersBankId } } },
      params: { bankId: usersBankId },
    });

    const mockNext = jest.fn();

    // Act
    validateBankIdForUser(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
  });
});
