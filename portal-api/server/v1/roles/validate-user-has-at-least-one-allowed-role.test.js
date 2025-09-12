const { when } = require('jest-when');
const { validateUserHasAtLeastOneAllowedRole } = require('./validate-user-has-at-least-one-allowed-role');
const { MAKER, READ_ONLY, CHECKER } = require('./roles');
const { userHasAtLeastOneAllowedRole } = require('./user-has-at-least-one-allowed-role');

jest.mock('./user-has-at-least-one-allowed-role', () => ({ userHasAtLeastOneAllowedRole: jest.fn() }));

describe('validateUserHasAtLeastOneAllowedRole', () => {
  describe('returns middleware that', () => {
    const allowedRoles = [MAKER, READ_ONLY];
    const req = { user: { roles: [CHECKER] } };

    let res;
    let next = jest.fn();

    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('calls next if the request user has at least one of the allowed roles', () => {
      when(userHasAtLeastOneAllowedRole).calledWith({ user: req.user, allowedRoles }).mockReturnValueOnce(true);
      const middleware = validateUserHasAtLeastOneAllowedRole({ allowedRoles });

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('does not set a status on the response if the request user has at least one of the allowed roles', () => {
      when(userHasAtLeastOneAllowedRole).calledWith({ user: req.user, allowedRoles }).mockReturnValueOnce(true);
      const middleware = validateUserHasAtLeastOneAllowedRole({ allowedRoles });

      middleware(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
    });

    it('does not send a json response if the request user has at least one of the allowed roles', () => {
      when(userHasAtLeastOneAllowedRole).calledWith({ user: req.user, allowedRoles }).mockReturnValueOnce(true);
      const middleware = validateUserHasAtLeastOneAllowedRole({ allowedRoles });

      middleware(req, res, next);

      expect(res.json).not.toHaveBeenCalled();
    });

    it('does not call next if the request user does not have at least one of the allowed roles', () => {
      when(userHasAtLeastOneAllowedRole).calledWith({ user: req.user, allowedRoles }).mockReturnValueOnce(false);
      const middleware = validateUserHasAtLeastOneAllowedRole({ allowedRoles });

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });

    it('returns a 401 error with a JSON message if the request user does not have at least one of the allowed roles', () => {
      when(userHasAtLeastOneAllowedRole).calledWith({ user: req.user, allowedRoles }).mockReturnValueOnce(false);
      const middleware = validateUserHasAtLeastOneAllowedRole({ allowedRoles });

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, msg: "You don't have access to this page" });
    });
  });
});
