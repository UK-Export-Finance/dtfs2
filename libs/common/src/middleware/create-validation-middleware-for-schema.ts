import { ZodError, ZodType } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { AnyObject, ApiErrorCode, ApiErrorResponseBody } from '../types';
import { API_ERROR_CODE } from '../constants';

/**
 * Formats the errors from a Zod validation error into a readable array of strings.
 *
 * @param error - The ZodError object containing validation issues.
 * @returns An array of formatted error messages, where each message includes the path,
 *          error message, and error code in the format: "path.to.field: message (code)".
 */
const getFormattedZodErrors = (error: ZodError): string[] => error.issues.map(({ path, message, code }) => `${path.join('.')}: ${message} (${code})`);

/**
 * Extracts an appropriate API error code from a given ZodError instance.
 *
 * This function iterates through the issues in the provided `ZodError` object
 * and attempts to map the error message to a corresponding `ApiErrorCode`.
 * If no specific error code is found, it defaults to `API_ERROR_CODE.INVALID_PAYLOAD`.
 *
 * @param error - The `ZodError` instance containing validation issues.
 * @returns The resolved `ApiErrorCode` based on the error messages, or
 *          `API_ERROR_CODE.INVALID_PAYLOAD` if no specific code is matched.
 */
const getErrorCode = (error: ZodError): ApiErrorCode => {
  const foundErrorCode: ApiErrorCode | undefined = error.issues.reduce(
    (errorCode, { message }) => {
      if (errorCode) {
        return errorCode;
      }

      switch (message) {
        case API_ERROR_CODE.INVALID_AUDIT_DETAILS:
          return API_ERROR_CODE.INVALID_AUDIT_DETAILS;
        default:
          return undefined;
      }
    },
    undefined as ApiErrorCode | undefined,
  );
  return foundErrorCode ?? API_ERROR_CODE.INVALID_PAYLOAD;
};

/**
 * Creates a middleware function to validate the request body against a given Zod schema.
 *
 * @template TSchema - The type of the Zod schema used for validation.
 * @param schema - The Zod schema to validate the request body against.
 * @returns A middleware function that validates the request body. If validation succeeds,
 *          the parsed data is assigned to `req.body` and the next middleware is called.
 *          If validation fails, a 400 Bad Request response is sent with the validation errors.
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 * import { validateSchema } from './create-validation-middleware-for-schema';
 *
 * const userSchema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 * });
 *
 * app.post('/users', validateSchema(userSchema), (req, res) => {
 *   // req.body is now typed and validated
 *   res.send('User created successfully');
 * });
 * ```
 */
export const validateSchema =
  <TSchema extends ZodType<AnyObject>>(schema: TSchema) =>
  (req: Request, res: Response<ApiErrorResponseBody>, next: NextFunction) => {
    const { success, error, data } = schema.safeParse(req.body);

    if (success) {
      req.body = data;
      return next();
    }

    const formattedErrors = getFormattedZodErrors(error);
    const errorCode = getErrorCode(error);

    console.error('An error has occurred during Payload validation %o', formattedErrors);
    return res.status(HttpStatusCode.BadRequest).send({
      status: HttpStatusCode.BadRequest,
      message: formattedErrors,
      code: errorCode,
    });
  };
