import mockResponse from '../../../helpers/responseMock';
import isMaker from '.';

describe('isMaker', () => {
  let req;
  let res;
  const next = jest.fn();

  beforeEach(() => {
    req = {
      session: {},
    };

    res = mockResponse();
  });

  it('redirects to root if user does not exist', () => {
    isMaker(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/');
  });

  it('redirects to root if user is not a maker', () => {
    req.session.user = { roles: ['checker', 'another-role'] };

    isMaker(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/');
  });

  it('calls next if user has maker role', () => {
    req.session.user = { roles: ['maker', 'another-role'] };

    isMaker(req, res, next);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
