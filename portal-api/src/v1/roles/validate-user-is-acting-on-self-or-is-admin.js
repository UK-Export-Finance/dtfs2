const { HttpStatusCode } = require('axios');
const CONSTANT = require('../../constants');
/**
 * Creates a middleware that returns a 401 error if the current user logs as admin or other user, and calls the next handler otherwise.
 * @param {{ allowedRoles: string[] }}
 * @returns {(req, res, next) => void}
 */
const validateUserPermission = (req, res, next) => {
  if (!req.user) {
    return res.status(HttpStatusCode.Unauthorized).send('Unauthorized');
  }

  const isActingOnSelf = req?.user?._id === req?.params?._id;
  const isAdmin = req?.user?.roles?.includes(CONSTANT.ADMIN);
  const isMaker = req?.user?.roles?.includes(CONSTANT.MAKER);

  if (!isActingOnSelf && !isAdmin && !isMaker) {
    return res.status(HttpStatusCode.Forbidden).send('Forbidden');
  }

  return next();
};

module.exports = {
  validateUserPermission,
};
