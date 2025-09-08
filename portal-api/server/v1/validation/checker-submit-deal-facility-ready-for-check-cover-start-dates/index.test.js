const { sub } = require('date-fns');
const CONSTANTS = require('../../../constants');

const checkCoverStartDate = require('.');

describe('validation - coverStartDate on ready for checkers approval', () => {
  const errorMessage = 'Requested Cover Start Date must be on the application submission date or in the future';
  const today = new Date();
  const yesterday = sub(today, { days: 1 });
  const twoDaysAgo = sub(today, { days: 2 });
  const threeDaysAgo = sub(today, { days: 3 });
  const fourDaysAgo = sub(today, { days: 4 });

  describe('AIN', () => {
    it('should throw validation error if requestedCoverStartDate is before today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: yesterday.valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {},
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors.requestedCoverStartDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if requestedCoverStartDate is today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: Date.now(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {},
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors).toEqual({});
    });

    it('should throw validation error if requestedCoverStartDate is before submissionDate', () => {
      const facility = {
        requestedCoverStartDate: threeDaysAgo.valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {
          submissionDate: twoDaysAgo.valueOf(),
        },
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors.requestedCoverStartDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if requestedCoverStartDate is today and submitted', () => {
      const facility = {
        requestedCoverStartDate: Date.now(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {
          submissionDate: twoDaysAgo.valueOf(),
        },
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors).toEqual({});
    });
  });

  describe('MIA', () => {
    it('should throw validation error if requestedCoverStartDate is before today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: yesterday.valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {},
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA,
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors.requestedCoverStartDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if requestedCoverStartDate is today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: today.valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {},
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA,
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors).toEqual({});
    });

    it('should throw validation error if requestedCoverStartDate is before today', () => {
      const facility = {
        requestedCoverStartDate: yesterday.valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {
          submissionDate: fourDaysAgo.valueOf(),
          manualInclusionApplicationSubmissionDate: twoDaysAgo.valueOf(),
        },
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA,
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors.requestedCoverStartDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if requestedCoverStartDate is today and submitted', () => {
      const facility = {
        requestedCoverStartDate: today.valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {
          submissionDate: fourDaysAgo.valueOf(),
          manualInclusionApplicationSubmissionDate: twoDaysAgo.valueOf(),
        },
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA,
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors).toEqual({});
    });
  });

  describe('MIN', () => {
    it('should not throw validation error if requestedCoverStartDate is today and not yet submitted', () => {
      const facility = {
        requestedCoverStartDate: today.valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {},
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors).toEqual({});
    });

    it('should throw validation error if requestedCoverStartDate is before manualInclusionNoticeSubmissionDate', () => {
      const facility = {
        requestedCoverStartDate: threeDaysAgo.valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {
          submissionDate: fourDaysAgo.valueOf(),
          manualInclusionApplicationSubmissionDate: fourDaysAgo.valueOf(),
          manualInclusionNoticeSubmissionDate: twoDaysAgo.valueOf(),
        },
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors.requestedCoverStartDate.text).toEqual(errorMessage);
    });

    it('should not throw validation error if requestedCoverStartDate is today and submitted', () => {
      const facility = {
        requestedCoverStartDate: today.valueOf(),
        status: CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const deal = {
        details: {
          submissionDate: fourDaysAgo.valueOf(),
          manualInclusionApplicationSubmissionDate: fourDaysAgo.valueOf(),
          manualInclusionNoticeSubmissionDate: twoDaysAgo.valueOf(),
        },
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      };

      const errors = checkCoverStartDate(deal, facility);

      expect(errors).toEqual({});
    });
  });
});
