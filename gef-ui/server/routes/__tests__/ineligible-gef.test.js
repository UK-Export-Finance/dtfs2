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
    require('../ineligible-gef');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/ineligible-gef', validateToken, expect.any(Function));
  });
});
