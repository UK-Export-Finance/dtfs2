const { HttpStatusCode } = require('axios');
const { validateUserPermission } = require('./validate-user-is-acting-on-self-or-is-admin');
const CONSTANT = require('../../constants');

describe('validateUserPermission', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: {
        _id: 'user123',
        roles: [],
      },
      params: {
        _id: 'user123',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next if user is acting on self', () => {
    validateUserPermission(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if user is not authenticated', () => {
    req.user = null;
    validateUserPermission(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized);
    expect(res.send).toHaveBeenCalledWith('Unauthorized');
  });

  it('should call next if user is admin', () => {
    req.user.roles = [CONSTANT.ADMIN];
    validateUserPermission(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should call next if user is maker', () => {
    req.user.roles = [CONSTANT.MAKER];
    validateUserPermission(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if user is not acting on self and is not admin or maker', () => {
    req.user._id = 'user456';
    validateUserPermission(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Forbidden);
    expect(res.send).toHaveBeenCalledWith('Forbidden');
  });
});
