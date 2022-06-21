const moment = require('moment');
const CONSTANTS = require('../../../src/constants');

const checkCoverStartDate = require('../../../src/v1/validation/checker-submit-deal-facility-ready-for-check-cover-start-dates');

describe('validation - coverStartDate on ready for checkers approval', () => {
  const errorMessage = 'Requested Cover Start Date must be on the application submission date or in the future';

  describe('AIN', () => {
    it('should throw validation error if requestedCoverStartDate is before today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: moment().subtract(1, 'day').utc().valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {},
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors.requestedCoverStartDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if requestedCoverStartDate is today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: moment().utc().valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {},
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors).toEqual({});
    });

    it('should throw validation error if requestedCoverStartDate is before submissionDate', () => {
      const facility = {
        requestedCoverStartDate: moment().subtract(3, 'day').utc().valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {
          submissionDate: moment().subtract(2, 'day').utc().valueOf(),
        },
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors.requestedCoverStartDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if requestedCoverStartDate is today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: moment().utc().valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {
          submissionDate: moment().subtract(2, 'day').utc().valueOf(),
        },
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors).toEqual({});
    });
  });

  describe('MIA', () => {
    it('should throw validation error if requestedCoverStartDate is before today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: moment().subtract(1, 'day').utc().valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {},
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors.requestedCoverStartDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if requestedCoverStartDate is today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: moment().utc().valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {},
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors).toEqual({});
    });

    it('should throw validation error if requestedCoverStartDate is before manualInclusionApplicationSubmissionDate', () => {
      const facility = {
        requestedCoverStartDate: moment().subtract(3, 'day').utc().valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {
          submissionDate: moment().subtract(4, 'day').utc().valueOf(),
          manualInclusionApplicationSubmissionDate: moment().subtract(2, 'day').utc().valueOf(),
        },
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors.requestedCoverStartDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if requestedCoverStartDate is today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: moment().utc().valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {
          submissionDate: moment().subtract(4, 'day').utc().valueOf(),
          manualInclusionApplicationSubmissionDate: moment().subtract(2, 'day').utc().valueOf(),
        },
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors).toEqual({});
    });
  });

  describe('MIN', () => {
    it('should throw validation error if requestedCoverStartDate is before today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: moment().subtract(1, 'day').utc().valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {},
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors.requestedCoverStartDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if requestedCoverStartDate is today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: moment().utc().valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {},
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors).toEqual({});
    });

    it('should throw validation error if requestedCoverStartDate is before manualInclusionNoticeSubmissionDate', () => {
      const facility = {
        requestedCoverStartDate: moment().subtract(3, 'day').utc().valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {
          submissionDate: moment().subtract(4, 'day').utc().valueOf(),
          manualInclusionApplicationSubmissionDate: moment().subtract(4, 'day').utc().valueOf(),
          manualInclusionNoticeSubmissionDate: moment().subtract(2, 'day').utc().valueOf(),
        },
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors.requestedCoverStartDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if requestedCoverStartDate is today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: moment().utc().valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {
          submissionDate: moment().subtract(4, 'day').utc().valueOf(),
          manualInclusionApplicationSubmissionDate: moment().subtract(4, 'day').utc().valueOf(),
          manualInclusionNoticeSubmissionDate: moment().subtract(2, 'day').utc().valueOf(),
        },
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors).toEqual({});
    });
  });
});
