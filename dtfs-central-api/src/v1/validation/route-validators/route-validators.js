import { param } from 'express-validator';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { isValidIsoMonth, isValidIsoYear, API_ERROR_CODE } from '@ukef/dtfs2-common';

const bankIdValidationValue = param('bankId').isString().matches(/^\d+$/).withMessage('The bank id provided should be a string of numbers');

export const bankIdValidation = [bankIdValidationValue];

/**
 * Validator for a path parameter which is a mongo id
 * @param {string} paramName
 * @returns {import('express').RequestHandler}
 */
export const mongoIdValidation = (paramName) => (req, res, next) => {
  const pathParam = req.params[paramName];
  if (ObjectId.isValid(pathParam)) {
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send({
    message: `Expected path parameter '${paramName}' to be a valid mongo id`,
    code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
  });
};

/**
 * Validator for a path parameter which is an sql integer id
 * @param {string} paramName - The parameter name
 * @returns {import('express').RequestHandler}
 */
export const sqlIdValidation = (paramName) => (req, res, next) => {
  const pathParam = req.params[paramName];
  if (/^\d+$/.test(pathParam)) {
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send({
    message: `Expected path parameter '${paramName}' to be a valid sql id`,
    code: API_ERROR_CODE.INVALID_SQL_ID_PATH_PARAMETER,
  });
};

/**
 * Validates that specified route or query parameters are strings in ISO month format 'yyyy-MM'
 * @param {string | string[]} fields - the field name(s) to validate
 * @return {import('express-validator').ValidationChain[]}
 */
export const isoMonthValidation = (fields) => [
  param(fields)
    .custom(isValidIsoMonth)
    .withMessage((value, { path }) => `'${path}' parameter must be an ISO month string (format 'yyyy-MM')`),
];

/**
 * Validates that specified route or query parameters are strings in ISO year format 'yyyy'
 * @param {string} paramName - The parameter name
 * @returns {import('express-validator').ValidationChain}
 */
export const yearValidation = (paramName) => param(paramName).custom(isValidIsoYear).withMessage(`Invalid '${paramName}' path param provided`);
