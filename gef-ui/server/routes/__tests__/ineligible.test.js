import validateToken from '../middleware/validate-token';

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
    require('../ineligible');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/ineligible', validateToken, expect.any(Function));
  });
});
