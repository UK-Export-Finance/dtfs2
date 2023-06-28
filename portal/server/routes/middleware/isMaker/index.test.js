import { mockReq, mockRes, mockNext } from '../../../test-mocks';
import isMaker from '.';

describe('isMaker', () => {
  let req;
  let res;

  beforeEach(() => {
    req = mockReq();
    res = mockRes();
  });

  it('redirects to root if user does not exist', () => {
    isMaker(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/');
  });

  it('redirects to root if user is not a maker', () => {
    req.session.user = { roles: ['checker', 'another-role'] };

    isMaker(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/');
  });

  it('calls mockNext if user has maker role', () => {
    req.session.user = { roles: ['maker', 'another-role'] };

    isMaker(req, res, mockNext);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
