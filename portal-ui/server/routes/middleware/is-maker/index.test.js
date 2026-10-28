import { ROLES } from '@ukef/dtfs2-common';
import mockResponse from '../../../helpers/responseMock';
import isMaker from '.';

const { CHECKER, MAKER } = ROLES;

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
    req.session.user = { roles: [CHECKER, 'another-role'] };

    isMaker(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/');
  });

  it('calls next if user has maker role', () => {
    req.session.user = { roles: [MAKER, 'another-role'] };

    isMaker(req, res, next);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
