import { validateToken } from '../../middleware';

const getSpy = jest.fn();
jest.doMock('express', () => ({
  Router() {
    return {
      get: getSpy,
    };
  },
}));

describe('routes/file', () => {
  beforeEach(async () => {
    await import('../downloadFile');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/file/:fileId', [validateToken, expect.any(Function)], expect.any(Function));
  });
});
