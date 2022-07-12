const moment = require('moment');
const CONSTANTS = require('../../../src/constants');

const checkCoverStartDate = require('../../../src/v1/validation/fields/cover-end-date');

describe('validation - coverEndDate on ready for checkers approval', () => {
  const errorMessage = 'Cover End Date must be today or in the future';

  describe('AIN', () => {
    it('should throw validation error if coverEndDate is before today and not yet submitted', () => {
      const errorList = {};

      const yesterday = moment().subtract(1, 'day');

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
      };
      const submittedValues = {
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
        'coverEndDate-day': moment(yesterday).format('DD'),
        'coverEndDate-month': moment(yesterday).format('MM'),
        'coverEndDate-year': moment(yesterday).format('YYYY'),
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if coverEndDate is before today and acknowledged', () => {
      const errorList = {};

      const yesterday = moment().subtract(1, 'day');

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
      };
      const submittedValues = {
        status: CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED,
        'coverEndDate-day': moment(yesterday).format('DD'),
        'coverEndDate-month': moment(yesterday).format('MM'),
        'coverEndDate-year': moment(yesterday).format('YYYY'),
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors).toEqual({});
    });
  });

  describe('MIN', () => {
    it('should throw validation error if coverEndDate is before today and not yet submitted', () => {
      const errorList = {};

      const yesterday = moment().subtract(1, 'day');

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN
      };
      const submittedValues = {
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
        'coverEndDate-day': moment(yesterday).format('DD'),
        'coverEndDate-month': moment(yesterday).format('MM'),
        'coverEndDate-year': moment(yesterday).format('YYYY'),
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if coverEndDate is before today and acknowledged', () => {
      const errorList = {};

      const yesterday = moment().subtract(1, 'day');

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN
      };
      const submittedValues = {
        status: CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED,
        'coverEndDate-day': moment(yesterday).format('DD'),
        'coverEndDate-month': moment(yesterday).format('MM'),
        'coverEndDate-year': moment(yesterday).format('YYYY'),
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors).toEqual({});
    });
  });

  describe('MIA', () => {
    it('should throw validation error if coverEndDate is before today and not yet submitted', () => {
      const errorList = {};

      const yesterday = moment().subtract(1, 'day');

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
      };
      const submittedValues = {
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
        'coverEndDate-day': moment(yesterday).format('DD'),
        'coverEndDate-month': moment(yesterday).format('MM'),
        'coverEndDate-year': moment(yesterday).format('YYYY'),
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual(errorMessage);
    });

    it('should throw validation error if coverEndDate is before today and acknowledged', () => {
      const errorList = {};

      const yesterday = moment().subtract(1, 'day');

      const deal = {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
      };
      const submittedValues = {
        status: CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED,
        'coverEndDate-day': moment(yesterday).format('DD'),
        'coverEndDate-month': moment(yesterday).format('MM'),
        'coverEndDate-year': moment(yesterday).format('YYYY'),
      };

      const errors = checkCoverStartDate(submittedValues, deal, errorList);

      expect(errors.coverEndDate.text).toEqual(errorMessage);
    });
  });
});
