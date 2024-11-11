import { Request, Response } from 'express';
import httpMocks, { MockRequest, MockResponse } from 'node-mocks-http';
import { errorHandlingAdaptor } from './error-handling-adaptor';

describe('errorHandlingAdaptor', () => {
  describe('when returning an error handling adaptor', () => {
    let req: MockRequest<Request>;
    let res: MockResponse<Response>;
    let next: jest.Mock;

    beforeEach(() => {
      jest.resetAllMocks();
      ({ res, req } = httpMocks.createMocks());
      next = jest.fn();
    });

    it('returns a function that calls the original function with req, res and next', async () => {
      // Arrange
      const initialFunction = jest.fn();

      // Act
      const wrappedFunction = errorHandlingAdaptor(initialFunction);
      await wrappedFunction(req, res, next);
      // Assert
      expect(initialFunction).toHaveBeenCalledWith(req, res, next);
    });

    it('passes any error thrown by the original to the next middleware', async () => {
      // Arrange
      const initialFunction = jest.fn().mockRejectedValue(new Error('Test Error'));

      // Act
      const wrappedFunction = errorHandlingAdaptor(initialFunction);
      await wrappedFunction(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(new Error('Test Error'));
    });
  });
});
