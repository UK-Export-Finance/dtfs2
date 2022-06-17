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
  beforeEach(() => {
    // eslint-disable-next-line global-require
    require('../downloadFile');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/file/:fileId', [validateToken, expect.any(Function)], expect.any(Function));
  });
});
