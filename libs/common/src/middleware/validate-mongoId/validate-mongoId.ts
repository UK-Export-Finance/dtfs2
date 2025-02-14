import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { API_ERROR_CODE } from '../../constants/api-error-code';

/**
 * Validator for a path parameter which is a mongo id
 * @param {string} paramName
 * @returns {import('express').RequestHandler}
 */
export const validateMongoId = (paramName: string) => (req: Request, res: Response, next: NextFunction) => {
  const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);
  const pathParam = req.params[paramName];
  const validationResult = mongoIdSchema.safeParse(pathParam);
  if (validationResult.success) {
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send({
    message: `Expected path parameter '${paramName}' to be a valid mongo id`,
    code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
  });
};
