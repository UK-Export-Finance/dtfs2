import { validateToken, validateBank } from '../../middleware';

const getSpy = jest.fn();
const postSpy = jest.fn();
jest.doMock('express', () => ({
  Router() {
    return {
      get: getSpy,
      post: postSpy,
    };
  },
}));

describe('Routes', () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    require('../unissued-facilities');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith(
      '/application-details/:dealId/unissued-facilities',
      [validateToken, validateBank, expect.any(Function)],
      expect.any(Function),
    );
    expect(postSpy).toHaveBeenCalledWith(
      '/application-details/:dealId/unissued-facilities/:facilityId/about',
      [validateToken, validateBank, expect.any(Function)],
      expect.any(Function),
    );
    expect(postSpy).toHaveBeenCalledWith(
      '/application-details/:dealId/unissued-facilities/:facilityId/change',
      [validateToken, validateBank, expect.any(Function)],
      expect.any(Function),
    );
    expect(postSpy).toHaveBeenCalledWith(
      '/application-details/:dealId/unissued-facilities/:facilityId/about',
      [validateToken, validateBank, expect.any(Function)],
      expect.any(Function),
    );
    expect(postSpy).toHaveBeenCalledWith(
      '/application-details/:dealId/unissued-facilities/:facilityId/change',
      [validateToken, validateBank, expect.any(Function)],
      expect.any(Function),
    );
    expect(postSpy).toHaveBeenCalledWith('/application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued', validateToken, expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith('/application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued', validateToken, expect.any(Function));
  });
});
