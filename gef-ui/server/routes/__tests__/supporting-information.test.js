import multer from 'multer';

import validateToken from '../../middleware/validateToken';

jest.mock('multer', () => () => ({
  array: jest.fn(),
  single: jest.fn(),
}));

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
    require('../supporting-information');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/application-details/:dealId/supporting-information/document/:documentType', [validateToken], expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith('/application-details/:dealId/supporting-information/document/:documentType', [validateToken, multer().array('documents', 2)], expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith('/application-details/:dealId/supporting-information/document/:documentType/upload', [validateToken], expect.any(Function), expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith('/application-details/:dealId/supporting-information/document/:documentType/delete', [validateToken], expect.any(Function));
  });
});
