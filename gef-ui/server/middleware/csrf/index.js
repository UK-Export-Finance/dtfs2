const csrfToken = () => (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

// For endpoints requiring file uploads, the csrf token can only be sent as part of the query rather than in the body.
// This is because these forms must use enctype="multipart/form-data"
// The csrf middleware we use expects to find the token in the body, so we copy it from the query to the body here.
const copyCsrfTokenFromQueryToBody = () => (req, res, next) => {
  if (req.query?._csrf && !req.body?._csrf) {
    if (!req.body) {
      req.body = {};
    }
    req.body._csrf = req.query._csrf;
  }

  next();
};

module.exports = {
  csrfToken,
  copyCsrfTokenFromQueryToBody,
};
