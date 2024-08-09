/**
 * Global middleware, removes csrf token from body of request if it exists.
 * @param {object} req Request object
 * @param {object} res Response object
 * @param {(input?: unknown) => void} next Callback function name
 */
const removeCsrfToken = (req, res, next) => {
  if (req?.body?._csrf) {
    delete req.body._csrf;
  }
  next();
};

module.exports = removeCsrfToken;
