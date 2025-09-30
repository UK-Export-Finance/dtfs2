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

require('../supporting-information-upload');

describe('Routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(postSpy).toHaveBeenCalledWith(
      '/application-details/:dealId/supporting-information/document/:documentType/upload',
      [validateToken, validateBank, expect.any(Function)],
      expect.any(Function),
      expect.any(Function),
    );
    expect(postSpy).toHaveBeenCalledWith(
      '/application-details/:dealId/supporting-information/document/:documentType/delete',
      [validateToken, validateBank, expect.any(Function)],
      expect.any(Function),
    );
  });
});
