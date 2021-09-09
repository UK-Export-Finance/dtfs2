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
    require('../ineligible-automatic-cover');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/application-details/:applicationId/ineligible-automatic-cover', validateToken, expect.any(Function));
  });
});
