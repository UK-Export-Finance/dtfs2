import httpMocks, { RequestOptions } from 'node-mocks-http';
import { validateMongoId, ValidateMongoIdRequest } from '.';

describe('validateMongoId', () => {
  const createHttpMocks = (options?: RequestOptions) => httpMocks.createMocks<ValidateMongoIdRequest>(options);

  it(`redirects to '/not-found' if an invalid MongoDB ID is provided`, () => {
    // Arrange
    const { res: mockRes, req: mockReq } = createHttpMocks({
      params: { _id: 'invalid-mongo-id' },
    });

    const mockNext = jest.fn();

    // Act
    validateMongoId(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes._getRedirectUrl()).toEqual('/not-found');
  });

  it('calls the next middleware function when a valid MongoDB ID is provided', () => {
    // Arrange
    const { res: mockRes, req: mockReq } = createHttpMocks({
      params: { _id: '5099803df3f4948bd2f98391' },
    });

    const mockNext = jest.fn();

    // Act
    validateMongoId(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
  });
});
