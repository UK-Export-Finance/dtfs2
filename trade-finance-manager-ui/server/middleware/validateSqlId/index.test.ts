import httpMocks, { RequestOptions } from 'node-mocks-http';
import { validateSqlId, ValidateSqlIdRequest } from '.';

describe('validateSqlId', () => {
  const paramName = 'id';

  const createHttpMocks = (options?: RequestOptions) => httpMocks.createMocks<ValidateSqlIdRequest>(options);

  it(`redirects to '/not-found' if a non integer id is provided`, () => {
    // Arrange
    const { res: mockRes, req: mockReq } = createHttpMocks({
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
    const { res: mockRes, req: mockReq } = createHttpMocks({
      params: { [paramName]: '54321' },
    });

    const mockNext = jest.fn();

    // Act
    validateSqlId(paramName)(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
  });
});
