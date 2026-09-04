const getCreditRatingCode = require('./get-credit-rating-code');
const CONSTANTS = require('../../../constants');

const { EXPORTER_CREDIT_RATING, CREDIT_RATING } = CONSTANTS.DEAL;

describe('getCreditRatingCode', () => {
  it(`should return ${CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS} for AIN submission type`, () => {
    const deal = {
      dealSnapshot: {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      },
    };

    const result = getCreditRatingCode(deal);

    expect(result).toEqual(CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS);
  });

  it(`should return ${CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS} for AIN submission type even when credit rating is different`, () => {
    const deal = {
      dealSnapshot: {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
      },
      fm: {
        exporterCreditRating: EXPORTER_CREDIT_RATING.BB_MINUS,
      },
    };

    const result = getCreditRatingCode(deal);

    expect(result).toEqual(CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS);
  });

  it(`should return ${CONSTANTS.FACILITY.CREDIT_RATING.BB_MINUS} for MIN submission type with ${EXPORTER_CREDIT_RATING.BB_MINUS} exporter credit rating`, () => {
    const deal = {
      dealSnapshot: {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      },
      tfm: {
        exporterCreditRating: EXPORTER_CREDIT_RATING.BB_MINUS,
      },
    };

    const result = getCreditRatingCode(deal);

    expect(result).toEqual(CONSTANTS.FACILITY.CREDIT_RATING.BB_MINUS);
  });

  it(`should return ${CONSTANTS.FACILITY.CREDIT_RATING.BB_MINUS} for MIN submission type with ${CREDIT_RATING.BB_MINUS} exporter credit rating`, () => {
    const deal = {
      dealSnapshot: {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      },
      tfm: {
        exporterCreditRating: CREDIT_RATING.BB_MINUS,
      },
    };

    const result = getCreditRatingCode(deal);

    expect(result).toEqual(CONSTANTS.FACILITY.CREDIT_RATING.BB_MINUS);
  });

  it(`should return ${CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS} for MIN submission type with ${EXPORTER_CREDIT_RATING.B_PLUS} exporter credit rating`, () => {
    const deal = {
      dealSnapshot: {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      },
      tfm: {
        exporterCreditRating: EXPORTER_CREDIT_RATING.B_PLUS,
      },
    };

    const result = getCreditRatingCode(deal);

    expect(result).toEqual(CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS);
  });

  it(`should return ${CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS} for MIN submission type with ${CREDIT_RATING.B_PLUS} exporter credit rating`, () => {
    const deal = {
      dealSnapshot: {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      },
      tfm: {
        exporterCreditRating: CREDIT_RATING.B_PLUS,
      },
    };

    const result = getCreditRatingCode(deal);

    expect(result).toEqual(CONSTANTS.FACILITY.CREDIT_RATING.B_PLUS);
  });

  it(`should return ${CONSTANTS.FACILITY.CREDIT_RATING.NOT_KNOWN} for MIN submission type with unknown exporter credit rating`, () => {
    const deal = {
      dealSnapshot: {
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      },
      tfm: {
        exporterCreditRating: 'AAA',
      },
    };

    const result = getCreditRatingCode(deal);

    expect(result).toEqual(CONSTANTS.FACILITY.CREDIT_RATING.NOT_KNOWN);
  });
});
