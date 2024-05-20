/**
 * Creates a middleware that returns a 401 error if the current user logs with
 * old password have at least one of the allowedRoles, and calls the next handler otherwise.
 * @param {{ allowedRoles: string[] }}
 * @returns {(req, res, next) => void}
 */
const validateSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }

  if (req?.user?._id !== req?.params?._id && !req?.user?.roles?.includes('admin')) {
    return res.status(403).send('Forbidden');
  }

  return next();
};

module.exports = {
  validateSelfOrAdmin,
}
