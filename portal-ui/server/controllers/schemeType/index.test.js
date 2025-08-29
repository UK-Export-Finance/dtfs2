import { getSchemeType, postSchemeType } from '.';
import mockResponse from '../../helpers/responseMock';

jest.mock('../../helpers', () => ({
  __esModule: true,
  validationErrorHandler: jest.fn(() => 'mock error'),
}));

describe('schemeType', () => {
  let req;
  let res;
  beforeEach(() => {
    req = {
      body: {},
      session: { user: 'mock-user' },
    };

    res = mockResponse();
  });

  describe('getSchemeType', () => {
    it('renders the expected template', () => {
      getSchemeType(req, res);

      expect(res.render).toHaveBeenCalledWith('select-scheme.njk', {
        user: 'mock-user',
      });
    });
  });

  describe('postSchemeType', () => {
    it('should redirect to bss if selected', () => {
      req.body.scheme = 'bss';
      postSchemeType(req, res);

      expect(res.render).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/before-you-start');
    });

    it('should redirect to gef if selected', () => {
      req.body.scheme = 'gef';
      postSchemeType(req, res);

      expect(res.render).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/gef/mandatory-criteria');
    });

    it('should return error if nothing is passed', () => {
      postSchemeType(req, res);

      expect(res.redirect).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith('select-scheme.njk', {
        errors: 'mock error',
      });
    });

    it('should return error if unknown scheme is passed', () => {
      req.body.scheme = 'another-scheme';
      postSchemeType(req, res);

      expect(res.redirect).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith('select-scheme.njk', {
        errors: 'mock error',
      });
    });
  });
});
