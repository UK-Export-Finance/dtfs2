import httpMocks from 'node-mocks-http';
import { validateSqlId } from '.';

describe('validateSqlId', () => {
  const paramName = 'id';

  it(`redirects to '/not-found' if a non integer id is provided`, () => {
    // Arrange
    const { res: mockRes, req: mockReq } = httpMocks.createMocks({
      params: { [paramName]: 'not-an-integer' },
    });

    const mockNext = jest.fn();

    // Act
    validateSqlId(paramName)(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes._getRedirectUrl()).toEqual('/not-found');
  });

  it('calls the next middleware function when an integer id is provided', () => {
    // Arrange
    const { res: mockRes, req: mockReq } = httpMocks.createMocks({
      params: { [paramName]: '54321' },
    });

    const mockNext = jest.fn();

    // Act
    validateSqlId(paramName)(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
  });
});
