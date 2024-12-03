const { sub, format } = require('date-fns');

const CONSTANTS = require('../../../constants');

const checkCoverStartDate = require('./cover-end-date');

describe('validation - coverEndDate on ready for checkers approval', () => {
  const errorMessage = 'Cover End Date must be today or in the future';

  const yesterday = sub(new Date(), { days: 1 });

  describe('AIN', () => {
    it('should throw validation error if coverEndDate is before today and not yet submitted', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
        'coverEndDate-day': format(yesterday, 'dd'),
        'coverEndDate-month': format(yesterday, 'MM'),
        'coverEndDate-year': format(yesterday, 'yyyy'),
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if coverEndDate is before today and acknowledged', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        status: CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED,
        'coverEndDate-day': format(yesterday, 'dd'),
        'coverEndDate-month': format(yesterday, 'MM'),
        'coverEndDate-year': format(yesterday, 'yyyy'),
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors).toEqual({});
    });

    it('should throw validation error if coverEndDate is 2 numbers long', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': '03',
        'coverEndDate-year': '23',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The year for the Cover End Date must include 4 numbers');
    });

    it('should throw validation error if coverEndDate is has letters in it', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': '03',
        'coverEndDate-year': '2O23',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The year for the Cover End Date must include 4 numbers');
    });

    it('should throw validation error if coverEndDate day is has symbol in it', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23-',
        'coverEndDate-month': '03',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The day for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate day is has a letter in it', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23a',
        'coverEndDate-month': '03',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The day for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate day is only a letter', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': 'a',
        'coverEndDate-month': '03',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The day for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate month is has symbol in it', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': '03-',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The month for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate month is has a letter in it', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': '03a',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The month for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate month is only a letter', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': 'a',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The month for the cover end date must only include 1 or 2 numbers');
    });
  });

  describe('MIN', () => {
    it('should throw validation error if coverEndDate is before today and not yet submitted', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      };
      const submittedValues = {
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
        'coverEndDate-day': format(yesterday, 'dd'),
        'coverEndDate-month': format(yesterday, 'MM'),
        'coverEndDate-year': format(yesterday, 'yyyy'),
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if coverEndDate is before today and acknowledged', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      };
      const submittedValues = {
        status: CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED,
        'coverEndDate-day': format(yesterday, 'dd'),
        'coverEndDate-month': format(yesterday, 'MM'),
        'coverEndDate-year': format(yesterday, 'yyyy'),
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors).toEqual({});
    });

    it('should throw validation error if coverEndDate is 2 numbers long', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': '03',
        'coverEndDate-year': '23',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The year for the Cover End Date must include 4 numbers');
    });

    it('should throw validation error if coverEndDate contains non numerical characters', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': '03',
        'coverEndDate-year': '2O23',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The year for the Cover End Date must include 4 numbers');
    });

    it('should throw validation error if coverEndDate day is has symbol in it', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23-',
        'coverEndDate-month': '03',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The day for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate day is has a letter in it', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23a',
        'coverEndDate-month': '03',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The day for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate day is only a letter', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': 'a',
        'coverEndDate-month': '03',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The day for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate month is has symbol in it', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': '03-',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The month for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate month is has a letter in it', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': '03a',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The month for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate month is only a letter', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': 'a',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The month for the cover end date must only include 1 or 2 numbers');
    });
  });

  describe('MIA', () => {
    it('should throw validation error if coverEndDate is before today and not yet submitted', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA,
      };
      const submittedValues = {
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
        'coverEndDate-day': format(yesterday, 'dd'),
        'coverEndDate-month': format(yesterday, 'MM'),
        'coverEndDate-year': format(yesterday, 'yyyy'),
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual(errorMessage);
    });

    it('should throw validation error if coverEndDate is before today and acknowledged', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA,
      };
      const submittedValues = {
        status: CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED,
        'coverEndDate-day': format(yesterday, 'dd'),
        'coverEndDate-month': format(yesterday, 'MM'),
        'coverEndDate-year': format(yesterday, 'yyyy'),
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual(errorMessage);
    });

    it('should throw validation error if coverEndDate is 2 numbers long', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': '03',
        'coverEndDate-year': '23',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The year for the Cover End Date must include 4 numbers');
    });

    it('should throw validation error if coverEndDate contains non numerical characters', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': '03',
        'coverEndDate-year': '2O23',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The year for the Cover End Date must include 4 numbers');
    });

    it('should throw validation error if coverEndDate day is has symbol in it', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23-',
        'coverEndDate-month': '03',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The day for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate day is has a letter in it', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23a',
        'coverEndDate-month': '03',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The day for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate day is only a letter', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': 'a',
        'coverEndDate-month': '03',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The day for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate month is has symbol in it', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': '03-',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The month for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate month is has a letter in it', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': '03a',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The month for the cover end date must only include 1 or 2 numbers');
    });

    it('should throw validation error if coverEndDate month is only a letter', () => {
      const errorList = {};

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };
      const submittedValues = {
        'coverEndDate-day': '23',
        'coverEndDate-month': 'a',
        'coverEndDate-year': '2023',
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual('The month for the cover end date must only include 1 or 2 numbers');
    });
  });
});
