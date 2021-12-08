import validateToken from '../../middleware/validateToken';

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
    require('../clone-gef-deal');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/application-details/:applicationId/clone', validateToken, expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith('/application-details/:applicationId/clone', validateToken, expect.any(Function));
    expect(getSpy).toHaveBeenCalledWith('/application-details/:applicationId/clone/name-application', validateToken, expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith('/application-details/:applicationId/clone/name-application', validateToken, expect.any(Function));
  });
});
