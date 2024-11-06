import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

type ValidatePayloadTestCases = { aTestCase: () => unknown; description: string }[];

/**
 * This is a reusable test to allow for validating payloads
 * It is intended to be used for any controller-level function that utilises
 * `req`, `res` and `next` as parameters
 * It allows for commonisation of test cases and commonisation of tests
 */

export const withValidatePayloadTests = ({
  makeRequest,
  failureTestCases,
  successTestCases,
  givenTheRequestWouldOtherwiseSucceed,
  successStatusCode,
}: {
  makeRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  failureTestCases: ValidatePayloadTestCases;
  successTestCases: ValidatePayloadTestCases;
  givenTheRequestWouldOtherwiseSucceed: () => void;
  successStatusCode: number;
}) => {
  describe('when validating the payload', () => {
    beforeEach(() => {
      givenTheRequestWouldOtherwiseSucceed();
    });

    it.each(failureTestCases)(`should respond with a '${HttpStatusCode.BadRequest}' if $description`, async ({ aTestCase }) => {
      // Arrange
      const { req, res } = getHttpMocks();
      const next = jest.fn();

      req.body = aTestCase();

      // Act
      await makeRequest(req, res, next);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
      expect(res._isEndCalled()).toEqual(true);
      expect(next).not.toHaveBeenCalled();
    });

    it.each(successTestCases)('should return a success status if $description', async ({ aTestCase }) => {
      // Arrange
      const { req, res } = getHttpMocks();
      const next = jest.fn();

      req.body = aTestCase();

      // Act
      await makeRequest(req, res, next);

      // Assert
      expect(res._getStatusCode()).toEqual(successStatusCode);
      expect(res._isEndCalled()).toEqual(true);
    });
  });

  function getHttpMocks() {
    return httpMocks.createMocks();
  }
};
