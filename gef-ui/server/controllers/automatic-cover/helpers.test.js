const { getValidationErrors, deriveCoverType } = require('./helpers');
const { DEAL_SUBMISSION_TYPE } = require('../../constants');

describe('controllers/automatic-cover/helpers', () => {
  const mockAllCriteria = [
    { id: 12, errRef: 12, errMsg: 'Mock error message' },
    { id: 13, errRef: 13, errMsg: 'Mock error message' },
    { id: 14, errRef: 14, errMsg: 'Mock error message' },
    { id: 15, errRef: 15, errMsg: 'Mock error message' },
    { id: 16, errRef: 16, errMsg: 'Mock error message' },
  ];

  describe('getValidationErrors', () => {
    it('should return errors for all fields that do not have values/answers', () => {
      const mockFields = {
        12: 'true',
        13: 'true',
        14: 'true',
      };

      const result = getValidationErrors(mockFields, mockAllCriteria);

      const expected = [
        { errRef: 15, errMsg: '15. Mock error message' },
        { errRef: 16, errMsg: '16. Mock error message' },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('deriveCoverType', () => {
    describe('when the received criteria answers length is not the same as all all criteria', () => {
      it('should return undefined', () => {
        const mockFields = {};

        const result = deriveCoverType(mockFields, mockAllCriteria);

        expect(result).toBeUndefined();
      });
    });

    describe('when all received criteria answers are `true`', () => {
      it(`should return ${DEAL_SUBMISSION_TYPE.AIN}`, () => {
        const mockFields = {
          12: 'true',
          13: 'true',
          14: 'true',
          15: 'true',
          16: 'true',
        };

        const result = deriveCoverType(mockFields, mockAllCriteria);

        expect(result).toEqual(DEAL_SUBMISSION_TYPE.AIN);
      });
    });

    describe('when some received criteria answers are `false`', () => {
      it(`should return ${DEAL_SUBMISSION_TYPE.MIA}`, () => {
        const mockFields = {
          12: 'true',
          13: 'true',
          14: 'true',
          15: 'true',
          16: 'false',
        };

        const result = deriveCoverType(mockFields, mockAllCriteria);

        expect(result).toEqual(DEAL_SUBMISSION_TYPE.MIA);
      });
    });
  });
});
