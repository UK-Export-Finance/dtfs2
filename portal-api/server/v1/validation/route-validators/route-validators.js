const { param } = require('express-validator');
const { ObjectId } = require('mongodb');
const { HttpStatusCode } = require('axios');
const { API_ERROR_CODE, isProduction } = require('@ukef/dtfs2-common');

const bankIdValidation = param('bankId')
  .exists()
  .withMessage('No bank id was provided')
  .isString()
  .withMessage('The bank id provided should be a string of numbers')
  .matches(/^\d+$/)
  .withMessage('The bank id provided should be a string of numbers');

/**
 * Validator for a path parameter which is a mongo id
 * @param {string} paramName
 * @returns {import('express').RequestHandler}
 */
const mongoIdValidation = (paramName) => (req, res, next) => {
  const pathParam = req.params[paramName];
  if (ObjectId.isValid(pathParam)) {
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send({
    message: `Expected path parameter '${paramName}' to be a valid mongo id`,
    code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
    status: HttpStatusCode.BadRequest,
  });
};

/**
 * Validator for a path parameter which is an sql integer id
 * @param {string} paramName - The parameter name
 * @returns {import('express-validator').ValidationChain}
 */
const sqlIdValidation = (paramName) => param(paramName).isInt({ min: 0 }).withMessage(`Invalid '${paramName}' path param provided`);

/**
 * Middleware to block requests if the environment is production.
 * @returns {import('express').RequestHandler} Express middleware that blocks requests in production.
 */
const isProductionValidation = () => (req, res, next) => {
  if (isProduction()) {
    return res.status(HttpStatusCode.Unauthorized).send({ status: HttpStatusCode.Unauthorized, message: 'Unauthorised insertion' });
  }

  return next();
};

module.exports = {
  bankIdValidation,
  mongoIdValidation,
  sqlIdValidation,
  isProductionValidation,
};
