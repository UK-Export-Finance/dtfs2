const validator = require('validator');
const { HttpStatusCode } = require('axios');
const { API_ERROR_CODE } = require('@ukef/dtfs2-common');

/**
 * Validator for a path parameter which is a mongo id
 * @param {string} paramName
 * @returns {import('express').RequestHandler}
 */
const validateMongoId = (paramName) => (req, res, next) => {
  const pathParam = req.params[paramName];
  if (validator.isMongoId(pathParam)) {
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send({
    message: `Expected path parameter '${paramName}' to be a valid mongo id`,
    code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
  });
};

module.exports = validateMongoId;
