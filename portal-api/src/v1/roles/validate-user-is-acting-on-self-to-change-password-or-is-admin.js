const { HttpStatusCode } = require('axios');
const CONSTANT = require('../../constants');
/**
 * Creates a middleware that returns a 401 error if the current user logs as admin or other user, and calls the next handler otherwise.
 * @param {{ allowedRoles: string[] }}
 * @returns {(req, res, next) => void}
 */
const validateUserIsActingOnSelfToChangePasswordOrIsAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(HttpStatusCode.Unauthorized).send('Unauthorized');
  }

  if (req?.user?._id !== req?.params?._id && !req?.user?.roles?.includes(CONSTANT.ADMIN) && !req?.user?.roles?.includes(CONSTANT.MAKER)) {
    return res.status(HttpStatusCode.Forbidden).send('Forbidden');
  }

  return next();
};

module.exports = {
  validateUserIsActingOnSelfToChangePasswordOrIsAdmin,
};
