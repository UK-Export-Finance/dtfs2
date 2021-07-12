import validateToken from '../middleware/validate-token';

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
    require('../application-details');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/application-details/:applicationId', validateToken, expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith('/application-details/:applicationId', validateToken, expect.any(Function));
    expect(getSpy).toHaveBeenCalledWith('/application-details/:applicationId/submit', validateToken, expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith('/application-details/:applicationId/submit', validateToken, expect.any(Function));
  });
});
