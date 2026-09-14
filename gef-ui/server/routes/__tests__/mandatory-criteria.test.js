import { validateToken } from '../../middleware';

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
  beforeEach(async () => {
    await import('../mandatory-criteria');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(routeSpy).toHaveBeenCalledWith('/mandatory-criteria');
    expect(allSpy).toHaveBeenCalledWith([validateToken, expect.any(Function)]);
    expect(getSpy).toHaveBeenCalledWith(expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith(expect.any(Function));
  });
});
