import { getSanitisedQueryValue, queryParams } from '.';
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
  const mockPasswordResetErrorParam = 'mock-error-param';
  const mockParamWithSpecialCharacters = 'mock-param&<>*!';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getSanitisedQueryValue', () => {
    it('should return a sanitised value', () => {
      const result = getSanitisedQueryValue(mockParamWithSpecialCharacters);

      const expected = replaceCharactersWithCharacterCode(mockParamWithSpecialCharacters);

      expect(result).toEqual(expected);
    });

    describe('when the value is a populated array with multiple items', () => {
      it('should return only the first item, sanitised', () => {
        const mockParamArray = [mockParamWithSpecialCharacters, mockPasswordResetParam];

        const result = getSanitisedQueryValue(mockParamArray);

        const expected = replaceCharactersWithCharacterCode(mockParamArray[0]);

        expect(result).toEqual(expected);
      });
    });

    describe('when the value is a populated array with only one item', () => {
      it('should return only the first item, sanitised', () => {
        const mockParamArray = [mockParamWithSpecialCharacters];

        const result = getSanitisedQueryValue(mockParamArray);

        const expected = replaceCharactersWithCharacterCode(mockParamArray[0]);

        expect(result).toEqual(expected);
      });
    });

    describe('when the value is an empty array', () => {
      it('should return null', () => {
        const result = getSanitisedQueryValue([]);

        expect(result).toEqual(null);
      });
    });
  });

  describe('queryParams', () => {
    describe('when query params is populated with a single allowed param (passwordreset)', () => {
      it('should sanitise and return the param', () => {
        req.query = {
          passwordreset: mockPasswordResetParam,
        };

        queryParams(req, res, nextSpy);

        const expected = {
          passwordreset: getSanitisedQueryValue(mockPasswordResetParam),
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
          passwordupdated: getSanitisedQueryValue(mockPasswordUpdatedParam),
        };

        expect(req.query).toEqual(expected);
      });
    });

    describe('when query params is populated with a single allowed param (passwordreseterror)', () => {
      it('should sanitise and return the param', () => {
        req.query = {
          passwordreseterror: mockPasswordResetErrorParam,
        };

        queryParams(req, res, nextSpy);

        const expected = {
          passwordreseterror: getSanitisedQueryValue(mockPasswordResetErrorParam),
        };

        expect(req.query).toEqual(expected);
      });
    });

    describe('when query params is populated with multiple allowed params over MAXIMUM_PARAMS', () => {
      it('should return 400 status and not return the param', () => {
        req.query = {
          passwordreset: mockPasswordResetParam,
          passwordupdated: mockPasswordUpdatedParam,
        };

        queryParams(req, res, nextSpy);

        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(req.query).toEqual({});
      });
    });

    describe('when query params is populated with a disallowed param', () => {
      it('should return 400 status and not return the param', () => {
        req.query = {
          notAllowed: mockPasswordResetParam,
        };

        queryParams(req, res, nextSpy);

        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(req.query).toEqual({});
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
});
