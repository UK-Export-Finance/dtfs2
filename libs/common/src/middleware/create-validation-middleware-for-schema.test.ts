import { z, ZodSafeParseError, ZodSafeParseSuccess, ZodIssue } from 'zod';
import { RequestHandler } from 'express';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { validateSchema } from './create-validation-middleware-for-schema';

console.error = jest.fn();

describe('createValidationMiddleware', () => {
  const aSuccessResponse = <T extends object>(data: T): ZodSafeParseSuccess<T> => ({
    success: true,
    data,
  });

  const anErrorResponse = (issues: ZodIssue[]): ZodSafeParseError<Record<string, unknown>> => {
    const result = z.record(z.string(), z.unknown()).safeParse(null);

    if (result.success) {
      throw new Error('Expected invalid record to fail validation');
    }

    result.error.issues.splice(0, result.error.issues.length, ...issues);
    return result;
  };

  const mockSchema = z.record(z.string(), z.unknown());
  const mockSafeParse = jest.spyOn(mockSchema, 'safeParse');

  const runValidator: RequestHandler = (req, res, next) => validateSchema(mockSchema)(req, res, next);

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('parses the request body using the supplied schema', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks();
    const next = jest.fn();

    const requestBody = {
      field1: 'Something',
      field2: 0,
    };
    req.body = { ...requestBody };

    mockSafeParse.mockReturnValue(aSuccessResponse({}));

    // Act
    runValidator(req, res, next);

    // Assert
    expect(mockSafeParse).toHaveBeenCalledWith(requestBody);
  });

  describe('when there are validation errors', () => {
    it('responds with a 400 and does not call the next function', () => {
      // Arrange
      const { req, res } = httpMocks.createMocks();
      const next = jest.fn();

      mockSafeParse.mockReturnValue(anErrorResponse([]));

      // Act
      runValidator(req, res, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
      expect(res._isEndCalled()).toEqual(true);
    });

    it('formats and logs the validation errors', () => {
      // Arrange
      const { req, res } = httpMocks.createMocks();
      const next = jest.fn();

      const issues: ZodIssue[] = [
        { path: ['field1', 'field2', 'field3'], message: 'Message about field 1', code: 'invalid_type', expected: 'array' },
        { path: ['field4'], message: 'Message about field 4', code: 'custom' },
      ];

      const expectedFormattedMessages = ['field1.field2.field3: Message about field 1 (invalid_type)', 'field4: Message about field 4 (custom)'];

      mockSafeParse.mockReturnValue(anErrorResponse(issues));

      // Act
      runValidator(req, res, next);

      // Assert
      expect(console.error).toHaveBeenCalledWith('An error has occurred during Payload validation %o', expectedFormattedMessages);
    });
  });

  describe('when there are no validation errors', () => {
    it('overwrites the request body with the parse result and calls the next method', () => {
      // Arrange
      const { req, res } = httpMocks.createMocks();
      const next = jest.fn();

      req.body = {
        field1: 'Some value',
        field2: 0,
      };

      const parsedData = {
        field1: 'Some value',
      };
      mockSafeParse.mockReturnValue(aSuccessResponse(parsedData));

      // Act
      runValidator(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res._isEndCalled()).toEqual(false);
      expect(req.body).toEqual(parsedData);
    });
  });
});
