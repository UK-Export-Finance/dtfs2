import validateToken from '../../middleware/validateToken';

const getSpy = jest.fn();
jest.doMock('express', () => ({
  Router() {
    return {
      get: getSpy,
    };
  },
}));

describe('Routes', () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    require('../eligible-automatic-cover');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/application-details/:dealId/eligible-automatic-cover', validateToken, expect.any(Function));
    expect(getSpy).toHaveBeenCalledWith('/application-details/:dealId/ineligible-automatic-cover', validateToken, expect.any(Function));
    expect(getSpy).toHaveBeenCalledWith('/ineligible-gef', validateToken, expect.any(Function));
  });
});
