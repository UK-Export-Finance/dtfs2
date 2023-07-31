/**
 * Global middleware, removes csrf token from body of request if it exists.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {String} next Callback function name
 */
const removeCsrfToken = (req, res, next) => {
  if (req?.body?._csrf) {
    delete req.body._csrf;
  }
  next();
};

module.exports = removeCsrfToken;
