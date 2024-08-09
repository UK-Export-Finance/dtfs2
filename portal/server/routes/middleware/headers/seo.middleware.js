/**
 * Global middleware, ensures page cannot be indexed or followed when queried in a search engine.
 * @param {object} req Request object
 * @param {object} res Response object
 * @param {(input?: unknown) => void} next Callback function name
 */
const seo = (req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, noimageindex, nosnippet');
  next();
};

module.exports = seo;
