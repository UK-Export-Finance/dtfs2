import { validateToken, validateBank } from '../../middleware';

jest.mock('multer', () => () => ({
  array: jest.fn(),
  single: jest.fn(),
}));

const postSpy = jest.fn();
jest.doMock('express', () => ({
  Router() {
    return {
      post: postSpy,
    };
  },
}));

describe('Routes', () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    require('../supporting-information-upload');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(postSpy).toHaveBeenCalledWith(
      '/application-details/:dealId/supporting-information/document/:documentType/upload',
      [expect.any(Function), validateToken, validateBank, expect.any(Function)],
      expect.any(Function),
      expect.any(Function),
    );
    expect(postSpy).toHaveBeenCalledWith(
      '/application-details/:dealId/supporting-information/document/:documentType/delete',
      [expect.any(Function), validateToken, validateBank, expect.any(Function)],
      expect.any(Function),
    );
  });
});
