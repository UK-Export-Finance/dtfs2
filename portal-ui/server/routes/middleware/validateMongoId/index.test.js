const httpMocks = require('node-mocks-http');
const validateMongoId = require('.');

describe('validateMongoId', () => {
  it(`redirects to '/not-found' if an invalid MongoDB ID is provided`, () => {
    // Arrange
    const { res: mockRes, req: mockReq } = httpMocks.createMocks({
      params: { _id: 'invalid-mongo-id' },
    });

    const mockNext = jest.fn();

    // Act
    validateMongoId(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).not.toHaveBeenCalled();
    // eslint-disable-next-line no-underscore-dangle
    expect(mockRes._getRedirectUrl()).toBe('/not-found');
  });

  it('calls the next middleware function when a valid MongoDB ID is provided', () => {
    // Arrange
    const { res: mockRes, req: mockReq } = httpMocks.createMocks({
      params: { _id: '5099803df3f4948bd2f98391' },
    });

    const mockNext = jest.fn();

    // Act
    validateMongoId(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
  });
});
