import { AnyZodObject, ZodError } from 'zod';
import { RequestHandler } from 'express';
import { HttpStatusCode } from 'axios';

const getFormattedZodErrors = (error: ZodError): string[] => error.issues.map(({ path, message }) => `${path.join('.')}: ${message}`);

export const createValidationMiddlewareForSchema =
  <TSchema extends AnyZodObject>(schema: TSchema): RequestHandler =>
  (req, res, next) => {
    const { success, error, data } = schema.safeParse(req.body);
    if (success) {
      req.body = data;
      return next();
    }
    const formattedErrors = getFormattedZodErrors(error);
    console.error('Payload validation error occurred:', formattedErrors);
    return res.status(HttpStatusCode.BadRequest).send(formattedErrors);
  };
