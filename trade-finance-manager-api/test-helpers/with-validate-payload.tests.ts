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
  successResponse,
  failureStatusCode = HttpStatusCode.BadRequest,
  failureResponse,
}: {
  makeRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  failureTestCases: ValidatePayloadTestCases;
  successTestCases: ValidatePayloadTestCases;
  givenTheRequestWouldOtherwiseSucceed: () => void;
  successStatusCode: number;
  successResponse?: unknown;
  failureStatusCode: number;
  failureResponse?: unknown;
}) => {
  describe('when validating the payload', () => {
    beforeEach(() => {
      givenTheRequestWouldOtherwiseSucceed();
    });

    describe('when the request body is invalid', () => {
      describe.each(failureTestCases)('when $description', ({ aTestCase }) => {
        itShouldReturnTheStatusCode({ aTestCase, statusCode: failureStatusCode });

        if (failureResponse) {
          itShouldReturnTheExpectedResponse({ aTestCase, expectedResponse: failureResponse });
        }
      });
    });

    describe('when the request body is valid', () => {
      describe.each(successTestCases)('when $description', ({ aTestCase }) => {
        itShouldReturnTheStatusCode({ aTestCase, statusCode: successStatusCode });

        if (failureResponse) {
          itShouldReturnTheExpectedResponse({ aTestCase, expectedResponse: successResponse });
        }
      });
    });
  });

  function getHttpMocks() {
    return httpMocks.createMocks();
  }

  function itShouldReturnTheStatusCode({ aTestCase, statusCode }: { aTestCase: () => unknown; statusCode: number }) {
    it(`should return a ${statusCode}`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      const next = jest.fn();

      req.body = aTestCase();

      // Act
      await makeRequest(req, res, next);

      // Assert
      expect(res._getStatusCode()).toEqual(statusCode);
      expect(res._isEndCalled()).toEqual(true);
    });
  }

  function itShouldReturnTheExpectedResponse({ aTestCase, expectedResponse }: { aTestCase: () => unknown; expectedResponse: unknown }) {
    it(`should return the expected response`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      const next = jest.fn();

      req.body = aTestCase();

      // Act
      await makeRequest(req, res, next);

      // Assert
      expect(res._getData()).toEqual(expectedResponse);
    });
  }
};
