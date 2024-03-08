import httpMocks from 'node-mocks-http';
import { validateSqlId } from '.';

describe('validateSqlId', () => {
  it(`redirects to '/not-found' if a non-integer id is provided`, () => {
    // Arrange
    const { res: mockRes, req: mockReq } = httpMocks.createMocks({
      params: { id: 'not-a-number' },
    });

    const mockNext = jest.fn();

    // Act
    validateSqlId(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).not.toHaveBeenCalled();
    // eslint-disable-next-line no-underscore-dangle
    expect(mockRes._getRedirectUrl()).toBe('/not-found');
  });

  it('calls the next middleware function when an integer id is provided', () => {
    // Arrange
    const { res: mockRes, req: mockReq } = httpMocks.createMocks({
      params: { id: '1234567' },
    });

    const mockNext = jest.fn();

    // Act
    validateSqlId(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
  });
});
