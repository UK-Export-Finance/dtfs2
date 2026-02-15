import { validateToken, validateBank } from '../../middleware';

const getSpy = jest.fn();
jest.doMock('express', () => ({
  Router() {
    return {
      get: getSpy,
    };
  },
}));

describe('Routes', () => {
  beforeEach(async () => {
    await import('../eligible-automatic-cover');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith(
      '/application-details/:dealId/eligible-automatic-cover',
      [validateToken, validateBank, expect.any(Function)],
      expect.any(Function),
    );
    expect(getSpy).toHaveBeenCalledWith(
      '/application-details/:dealId/ineligible-automatic-cover',
      [validateToken, validateBank, expect.any(Function)],
      expect.any(Function),
    );
    expect(getSpy).toHaveBeenCalledWith('/ineligible-gef', [validateToken, expect.any(Function)], expect.any(Function));
  });
});
