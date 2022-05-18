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
    require('../application-submission');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/application-details/:dealId/submit', [validateToken, validateBank, expect.any(Function)], expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith('/application-details/:dealId/submit', [validateToken, validateBank, expect.any(Function)], expect.any(Function));
  });
});
