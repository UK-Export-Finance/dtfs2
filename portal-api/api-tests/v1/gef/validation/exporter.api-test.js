const {
  unansweredFields,
  exporterValidation,
  exporterCheckEnums,
  exporterStatus,
} = require('../../../../src/v1/gef/controllers/validation/exporter');
const CONSTANTS = require('../../../../src/constants');
const { SME_TYPE } = require('../../../../src/v1/gef/enums');

describe('GEF controllers validation - exporter', () => {
  const mockAnswersValid = {
    companiesHouseRegistrationNumber: true,
    companyName: true,
    registeredAddress: true,
    selectedIndustry: true,
    industries: true,
    smeType: true,
    probabilityOfDefault: true,
    isFinanceIncreasing: true,
  };

  describe('unansweredFields', () => {
    it('should return an array of unanswered fields', () => {
      const mockAnswers = {
        ...mockAnswersValid,
        companiesHouseRegistrationNumber: null,
        companyName: null,
      };

      const result = unansweredFields(mockAnswers);

      const expected = [
        'companiesHouseRegistrationNumber',
        'companyName',
      ];

      expect(result).toEqual(expected);
    });

    it('should return an empty array when all fields provided', () => {
      const result = unansweredFields(mockAnswersValid);

      expect(result).toEqual([]);
    });
  });

  describe('exporterStatus', () => {
    describe('when no answers are provided', () => {
      it('should return NOT_STARTED status', () => {
        const result = exporterStatus({});

        expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED);
      });
    });

    describe('when some answers are provided', () => {
      it('should return IN_PROGRESS status', () => {
        const result = exporterStatus({
          companiesHouseRegistrationNumber: true,
        });

        expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS);
      });
    });

    describe('when all answers are provided', () => {
      it('should return COMPLETED status', () => {
        const result = exporterStatus(mockAnswersValid);

        expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.COMPLETED);
      });
    });
  });

  describe('exporterCheckEnums', () => {
    describe('when a valid smeType is passed', () => {
      it('should return null', () => {
        const result = exporterCheckEnums({
          smeType: SME_TYPE.MICRO,
        });

        expect(result).toEqual(null);
      });
    });

    describe('when a null smeType is passed', () => {
      it('should return null', () => {
        const result = exporterCheckEnums({
          smeType: null,
        });

        expect(result).toEqual(null);
      });
    });

    describe('when smeType is passed as undefined', () => {
      it('should return null', () => {
        const result = exporterCheckEnums({
          smeType: undefined,
        });

        expect(result).toEqual(null);
      });
    });

    describe('when an invalid smeType is passed', () => {
      it('should return an error array', () => {
        const result = exporterCheckEnums({
          smeType: 'INVALID',
        });

        const expected = [
          { errCode: 'ENUM_ERROR', errMsg: 'Unrecognised enum', errRef: 'smeType' }
        ];

        expect(result).toEqual(expected);
      });
    });
  });
});
