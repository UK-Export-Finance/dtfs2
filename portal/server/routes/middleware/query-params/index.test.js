import queryParams from '.';
import { replaceCharactersWithCharacterCode } from '../../../helpers/sanitiseData';
import { mockReq, mockRes } from '../../../test-mocks';

describe('middleware/query-params', () => {
  const req = mockReq();
  const res = mockRes();

  const nextSpy = jest.fn();
  const statusSpy = jest.fn();

  res.status = statusSpy;

  req.query = {};

  const mockPasswordResetParam = 'mock-reset-param';
  const mockPasswordUpdatedParam = 'mock-updated-param';
  const mockPasswordResetError = 'mock-error-param';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when query params is populated with a single allowed param (passwordreset)', () => {
    it('should sanitise and return the param', () => {
      req.query = {
        passwordreset: mockPasswordResetParam,
      };

      queryParams(req, res, nextSpy);

      const expected = {
        passwordreset: replaceCharactersWithCharacterCode(mockPasswordResetParam),
      };

      expect(req.query).toEqual(expected);
    });
  });

  describe('when query params is populated with a single allowed param (passwordupdated)', () => {
    it('should sanitise and return the param', () => {
      req.query = {
        passwordupdated: mockPasswordUpdatedParam,
      };

      queryParams(req, res, nextSpy);

      const expected = {
        passwordupdated: replaceCharactersWithCharacterCode(mockPasswordUpdatedParam),
      };

      expect(req.query).toEqual(expected);
    });
  });

  describe('when query params is populated with a single allowed param (passwordreseterror)', () => {
    it('should sanitise and return the param', () => {
      req.query = {
        passwordreseterror: mockPasswordResetError,
      };

      queryParams(req, res, nextSpy);

      const expected = {
        passwordreseterror: replaceCharactersWithCharacterCode(mockPasswordResetError),
      };

      expect(req.query).toEqual(expected);
    });
  });

  describe('when query params is populated with multiple allowed params over MAXIMUM_PARAMS', () => {
    it('should return 400 status', () => {
      req.query = {
        passwordreset: mockPasswordResetParam,
        passwordupdated: mockPasswordUpdatedParam,
      };

      queryParams(req, res, nextSpy);

      expect(statusSpy).toHaveBeenCalledWith(400);
    });
  });

  describe('when query params is populated with a disallowed param', () => {
    it('should return 400 status', () => {
      req.query = {
        notAllowed: mockPasswordResetParam,
      };

      queryParams(req, res, nextSpy);

      expect(statusSpy).toHaveBeenCalledWith(400);
    });
  });

  describe('when no params are provided', () => {
    it('should call next()', () => {
      req.query = {};

      queryParams(req, res, nextSpy);

      expect(nextSpy).toHaveBeenCalledTimes(1);
    });
  });
});
