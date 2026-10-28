const { isValidMongoId } = require('../../../validation/validate-ids');

/**
 * Redirects the user to '/not-found' if an invalid MongoDB '_id' path param is
 * provided
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const validateMongoId = (req, res, next) => {
  const { _id } = req.params;

  if (!isValidMongoId(_id)) {
    console.error(`Invalid MongoDB '_id' param provided: '${_id}'`);
    return res.redirect('/not-found');
  }

  return next();
};

module.exports = validateMongoId;
