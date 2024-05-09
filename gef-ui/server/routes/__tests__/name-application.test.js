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
    require('../name-application');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/name-application', [validateToken, expect.any(Function)], expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith('/name-application', [validateToken, expect.any(Function)], expect.any(Function));
    expect(getSpy).toHaveBeenCalledWith('/applications/:dealId/name', [validateToken, validateBank, expect.any(Function)], expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith('/applications/:dealId/name', [validateToken, validateBank, expect.any(Function)], expect.any(Function));
  });
});
