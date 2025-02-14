import { ObjectId } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { API_ERROR_CODE } from '../../constants/api-error-code';

/**
 * Validator for a path parameter which is a mongo id
 * @param {string} paramName
 * @returns {import('express').RequestHandler}
 */
export const validateMongoId = (paramName: string) => (req: Request, res: Response, next: NextFunction) => {
  const pathParam = req.params[paramName] as string;
  if (ObjectId.isValid(pathParam)) {
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send({
    message: `Expected path parameter '${paramName}' to be a valid mongo id`,
    code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
  });
};
