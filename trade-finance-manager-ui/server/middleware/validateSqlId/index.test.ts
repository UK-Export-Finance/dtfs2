import httpMocks from 'node-mocks-http';
import { Request } from 'express';
import { validateSqlId } from '.';

describe('validateSqlId', () => {
  it(`redirects to '/not-found' if a non integer id is provided`, () => {
    // Arrange
    const { res: mockRes, req: mockReq } = httpMocks.createMocks<Request<{ _id: string }>>({
      params: { id: 'not-an-integer' },
    });

    const mockNext = jest.fn();

    // Act
    validateSqlId(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes._getRedirectUrl()).toBe('/not-found');
  });

  it('calls the next middleware function when an integer id is provided', () => {
    // Arrange
    const { res: mockRes, req: mockReq } = httpMocks.createMocks({
      params: { id: '54321' },
    });

    const mockNext = jest.fn();

    // Act
    validateSqlId(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
  });
});
