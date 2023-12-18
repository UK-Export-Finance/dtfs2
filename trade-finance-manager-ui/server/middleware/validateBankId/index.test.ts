import httpMocks from 'node-mocks-http';
import { Request } from 'express';
import { validateBankId } from '.';

console.error = jest.fn();

describe('validateBankId', () => {
  const notFoundUrl = '/not-found';
  it.each`
    description                             | value
    ${'undefined'}                          | ${undefined}
    ${'a string with non-digit characters'} | ${'abc'}
    ${'a string with a non-integer number'} | ${'12.3'}
  `(`should redirect to ${notFoundUrl} when the bankId is $description`, ({ value }: { value: string | undefined }) => {
    // Arrange
    const { req: mockRequest, res: mockResponse } = httpMocks.createMocks<Request<{ bankId: string }>>({
      params: { bankId: value },
    });
    const mockNext = jest.fn();

    // Act
    validateBankId(mockRequest, mockResponse, mockNext);

    // Assert
    // eslint-disable-next-line no-underscore-dangle
    expect(mockResponse._getRedirectUrl()).toBe(notFoundUrl);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call the next function when a valid bank id is provided', () => {
    // Arrange
    const { req: mockRequest, res: mockResponse } = httpMocks.createMocks<Request<{ bankId: string }>>({
      params: { bankId: '123' },
    });
    const mockNext = jest.fn();

    // Act
    validateBankId(mockRequest, mockResponse, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalled();
  });
});
