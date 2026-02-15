import multer from 'multer';

import { validateToken, validateBank } from '../../middleware';

jest.mock('multer', () => () => ({
  array: jest.fn(),
  single: jest.fn(),
}));

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
    await import('../supporting-information');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(routeSpy).toHaveBeenCalledWith('/application-details/:dealId/supporting-information/document/:documentType');
    expect(allSpy).toHaveBeenCalledWith([validateToken, validateBank, expect.any(Function)]);
    expect(getSpy).toHaveBeenCalledWith(expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith(multer().array('documents', 2), expect.any(Function));
  });
});
