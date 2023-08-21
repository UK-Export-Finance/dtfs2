const { when } = require('jest-when');
const { validateUserHasSufficientRole } = require('./validate-user-has-sufficient-role');
const { MAKER, READ_ONLY, CHECKER } = require('./roles');
const { userHasSufficientRole } = require('./user-has-sufficient-role');

jest.mock('./user-has-sufficient-role', () => ({ userHasSufficientRole: jest.fn() }));

describe('validateUserHasSufficientRole', () => {
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

    it('calls next if the request user has sufficient roles for the allowed roles', () => {
      when(userHasSufficientRole).calledWith({ user: req.user, allowedRoles }).mockReturnValueOnce(true);
      const middleware = validateUserHasSufficientRole({ allowedRoles });

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('does not set a status on the response if the request user has sufficient roles for the allowed roles', () => {
      when(userHasSufficientRole).calledWith({ user: req.user, allowedRoles }).mockReturnValueOnce(true);
      const middleware = validateUserHasSufficientRole({ allowedRoles });

      middleware(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
    });

    it('does not send a json response if the request user has sufficient roles for the allowed roles', () => {
      when(userHasSufficientRole).calledWith({ user: req.user, allowedRoles }).mockReturnValueOnce(true);
      const middleware = validateUserHasSufficientRole({ allowedRoles });

      middleware(req, res, next);

      expect(res.json).not.toHaveBeenCalled();
    });

    it('does not call next if the request user does not have sufficient roles for the allowed roles', () => {
      when(userHasSufficientRole).calledWith({ user: req.user, allowedRoles }).mockReturnValueOnce(false);
      const middleware = validateUserHasSufficientRole({ allowedRoles });

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });

    it('returns a 401 error with a JSON message if the request user does not have sufficient roles for the allowed roles', () => {
      when(userHasSufficientRole).calledWith({ user: req.user, allowedRoles }).mockReturnValueOnce(false);
      const middleware = validateUserHasSufficientRole({ allowedRoles });

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, msg: "You don't have access to this page" });
    });
  });
});
