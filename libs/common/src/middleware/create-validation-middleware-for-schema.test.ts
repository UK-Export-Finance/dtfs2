import { AnyZodObject, SafeParseError, SafeParseSuccess, ZodError, ZodIssue } from 'zod';
import { RequestHandler } from 'express';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { createValidationMiddlewareForSchema } from './create-validation-middleware-for-schema';

console.error = jest.fn();

describe('createValidationMiddleware', () => {
  const aSuccessResponse = <T extends object>(data: T): SafeParseSuccess<T> => ({
    success: true,
    data,
  });

  const anErrorResponse = (issues: ZodIssue[]): SafeParseError<object> => ({
    success: false,
    error: { issues } as ZodError<object>,
  });

  const mockSafeParse = jest.fn();

  const mockSchema = {
    safeParse: mockSafeParse,
  } as unknown as AnyZodObject;

  const runValidator: RequestHandler = (req, res, next) => createValidationMiddlewareForSchema(mockSchema)(req, res, next);

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
        { path: ['field1', 'field2', 'field3'], message: 'Message about field 1', code: 'invalid_type', expected: 'array', received: 'nan' },
        { path: ['field4'], message: 'Message about field 4', code: 'not_finite' },
      ];

      const expectedFormattedMessages = ['field1.field2.field3: Message about field 1 (invalid_type)', 'field4: Message about field 4 (not_finite)'];

      mockSafeParse.mockReturnValue(anErrorResponse(issues));

      // Act
      runValidator(req, res, next);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Payload validation error occurred:', expectedFormattedMessages);
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
