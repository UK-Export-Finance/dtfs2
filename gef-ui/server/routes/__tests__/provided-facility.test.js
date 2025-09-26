import { validateToken, validateBank } from '../../middleware';

const routeSpy = jest.fn();
const allSpy = jest.fn().mockReturnThis();
const getSpy = jest.fn().mockReturnThis();
const postSpy = jest.fn().mockReturnThis();
jest.doMock('express', () => ({
  Router: () => ({
    route: routeSpy.mockReturnValue({
      all: allSpy,
      get: getSpy,
      post: postSpy,
    }),
  }),
}));

describe('Routes', () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    require('../facilities/provided-facility');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(routeSpy).toHaveBeenCalledWith('/application-details/:dealId/facilities/:facilityId/provided-facility');
    expect(allSpy).toHaveBeenCalledWith([validateToken, validateBank, expect.any(Function)]);
    expect(getSpy).toHaveBeenCalledWith(expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith(expect.any(Function));
  });
});
