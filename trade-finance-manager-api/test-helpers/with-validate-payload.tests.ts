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
  validatePayload,
  failureTestCases,
  successTestCases,
}: {
  validatePayload: (req: Request, res: Response, next: NextFunction) => void;
  failureTestCases: ValidatePayloadTestCases;
  successTestCases: ValidatePayloadTestCases;
}) => {
  it.each(failureTestCases)(`should respond with a '${HttpStatusCode.BadRequest}' if $description`, ({ aTestCase }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = aTestCase();

    // Act
    validatePayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it.each(successTestCases)('should call "next" if $description', ({ aTestCase }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = aTestCase();

    // Act
    validatePayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });

  function getHttpMocks() {
    return httpMocks.createMocks();
  }
};
