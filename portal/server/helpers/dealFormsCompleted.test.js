import { FACILITY_STATUS } from '@ukef/dtfs2-common';
import { isEligibilityComplete, isSubmissionDetailComplete, isEveryDealFormComplete, isEveryFacilityInDealComplete } from './dealFormsCompleted';
import CONSTANTS from '../constants';

const completeFacilities = {
  items: [
    { _id: '12345678910', status: FACILITY_STATUS.COMPLETED },
    { _id: '12345678911', status: FACILITY_STATUS.COMPLETED },
    { _id: '12345678912', status: FACILITY_STATUS.COMPLETED },
  ],
};

const incompleteFacilities = {
  items: [
    { _id: '12345678911', status: FACILITY_STATUS.COMPLETED },
    { _id: '12345678910', status: FACILITY_STATUS.INCOMPLETE },
  ],
};

const acknowledgedFacilities = {
  items: [
    {
      _id: '12345678911',
      status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED,
      requestedCoverStartDate: 123,
      coverDateConfirmed: true,
    },
    {
      _id: '12345678912',
      status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED,
      requestedCoverStartDate: 123,
      coverDateConfirmed: true,
    },
  ],
};

const submittedLoans = {
  items: [
    {
      _id: '12345678910',
      status: CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF,
      requestedCoverStartDate: 123,
      coverDateConfirmed: true,
    },
    {
      _id: '12345678911',
      status: CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF,
      requestedCoverStartDate: 123,
      coverDateConfirmed: true,
    },
  ],
};

const submittedBonds = {
  items: [
    {
      _id: '12345678912',
      status: CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF,
      requestedCoverStartDate: 123,
      coverDateConfirmed: true,
    },
    {
      _id: '12345678913',
      status: CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF,
      requestedCoverStartDate: 123,
      coverDateConfirmed: true,
    },
  ],
};

const submittedBondsWithMissingProperties = {
  items: [
    {
      _id: '12345678910',
      status: CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF,
      requestedCoverStartDate: 123,
      coverDateConfirmed: true,
    },
    { _id: '12345678911', status: CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF },
  ],
};

const submittedLoansWithMissingProperties = {
  items: [
    { _id: '12345678912', status: CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF },
    {
      _id: '12345678913',
      status: CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF,
      requestedCoverStartDate: 123,
      coverDateConfirmed: true,
    },
  ],
};

const completeBonds = completeFacilities;
const incompleteBonds = incompleteFacilities;
const completeLoans = completeFacilities;
const incompleteLoans = incompleteFacilities;
const acknowledgedBonds = {
  ...completeFacilities,
  acknowledgedFacilities,
};
const acknowledgedLoans = {
  ...completeFacilities,
  acknowledgedFacilities,
};

const incompleteSubmissionDetails = { status: CONSTANTS.STATUS.SECTION.NOT_COMPLETED };
const completeSubmissionDetails = { status: CONSTANTS.STATUS.SECTION.COMPLETED };
const incompleteEligibility = { status: CONSTANTS.STATUS.SECTION.NOT_COMPLETED };
const completeEligibility = { status: CONSTANTS.STATUS.SECTION.COMPLETED };

describe('isEveryFacilityInDealComplete', () => {
  it('should return false if a deal has neither a bond nor a loan', () => {
    const deal = {
      bondTransactions: { items: [] },
      loanTransactions: { items: [] },
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryFacilityInDealComplete(deal)).toEqual(false);
  });

  it('should return false if a deal has any bond with status `Incomplete`', () => {
    const deal = {
      bondTransactions: incompleteBonds,
      loanTransactions: { items: [] },
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryFacilityInDealComplete(deal)).toEqual(false);
  });

  it('should return false if a deal has any loan with status `Incomplete`', () => {
    const deal = {
      bondTransactions: { items: [] },
      loanTransactions: incompleteLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryFacilityInDealComplete(deal)).toEqual(false);
  });

  it('should return true when all the bonds have `Completed` status', () => {
    const deal = {
      bondTransactions: completeBonds,
      loanTransactions: { items: [] },
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryFacilityInDealComplete(deal)).toEqual(true);
  });

  it('should return true when all the loans have `Completed` status', () => {
    const deal = {
      bondTransactions: { items: [] },
      loanTransactions: completeLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryFacilityInDealComplete(deal)).toEqual(true);
  });

  it('should return true when all the loans have `Submitted` status', () => {
    const deal = {
      bondTransactions: { items: [] },
      loanTransactions: submittedLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryFacilityInDealComplete(deal)).toEqual(true);
  });

  it('should return true when all the bonds have `Submitted` status', () => {
    const deal = {
      bondTransactions: submittedBonds,
      loanTransactions: { items: [] },
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryFacilityInDealComplete(deal)).toEqual(true);
  });

  it('should return true when both bonds and loans have `Submitted` status', () => {
    const deal = {
      bondTransactions: submittedBonds,
      loanTransactions: submittedLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryFacilityInDealComplete(deal)).toEqual(true);
  });

  it('should return false when both bonds and loans have `Submitted` status but with missing mandatory properties', () => {
    const deal = {
      bondTransactions: submittedBondsWithMissingProperties,
      loanTransactions: submittedLoansWithMissingProperties,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryFacilityInDealComplete(deal)).toEqual(false);
  });
});

describe('isEveryDealFormComplete', () => {
  it('If the `Acknowledged` loan does not have all the required properties', () => {
    const incompleteAcknowledgedLoan = {
      ...acknowledgedLoans,
      items: [
        { _id: '12345678911', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: null },
        {
          _id: '12345678912',
          status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED,
          requestedCoverStartDate: 123,
          coverDateConfirmed: true,
        },
      ],
    };

    const deal = {
      bondTransactions: incompleteAcknowledgedLoan,
      loanTransactions: acknowledgedBonds,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(false);
  });

  it('If the `Acknowledged` bonds does not have all the required properties', () => {
    const incompleteAcknowledgedBonds = {
      ...acknowledgedBonds,
      items: [
        { _id: '12345678911', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: null },
        { _id: '12345678912', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: null },
      ],
    };

    const deal = {
      bondTransactions: incompleteAcknowledgedBonds,
      loanTransactions: acknowledgedLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(false);
  });

  it('If both the `Acknowledged` bond and loan does not have all the required properties', () => {
    const incompleteAcknowledgedLoan = {
      ...acknowledgedLoans,
      items: [
        { _id: '12345678911', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: null },
        { _id: '12345678912', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: null },
      ],
    };

    const incompleteAcknowledgedBond = {
      ...acknowledgedBonds,
      items: [
        { _id: '12345678911', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: null },
        {
          _id: '12345678912',
          status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED,
          requestedCoverStartDate: 123,
          coverDateConfirmed: true,
        },
      ],
    };

    const deal = {
      bondTransactions: incompleteAcknowledgedLoan,
      loanTransactions: incompleteAcknowledgedBond,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(false);
  });

  it('If both the bond and loan are `Submitted` and does not have all the required properties', () => {
    const deal = {
      bondTransactions: submittedBondsWithMissingProperties,
      loanTransactions: submittedLoansWithMissingProperties,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(false);
  });

  it('If both the bond and loan are `Submitted` and have all the required properties', () => {
    const deal = {
      bondTransactions: submittedBonds,
      loanTransactions: submittedLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(true);
  });

  it("should return false when a deal's eligibility.status is `Incomplete`", () => {
    const deal = {
      eligibility: incompleteEligibility,
      bondTransactions: completeBonds,
      submissionDetails: completeSubmissionDetails,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(false);
  });

  it("should return false when a deal's submissionDetails.status is `Incomplete`", () => {
    const deal = {
      submissionDetails: incompleteSubmissionDetails,
      bondTransactions: completeBonds,
      loanTransactions: completeLoans,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(false);
  });

  it('should return false if a deal has no bonds and no loans`', () => {
    const deal = {
      bondTransactions: { items: [] },
      loanTransactions: { items: [] },
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(false);
  });

  it("should return false if a deal has any bonds who's bond.status is `Incomplete`", () => {
    const deal = {
      bondTransactions: incompleteBonds,
      loanTransactions: { items: [] },
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(false);
  });

  it("should return false if a deal has any loan who's loan.status is `Incomplete`", () => {
    const deal = {
      bondTransactions: { items: [] },
      loanTransactions: incompleteLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(false);
  });

  it('If there are 1+ loans, should return true if all sections are in status `Completed`', () => {
    const deal = {
      bondTransactions: { items: [] },
      loanTransactions: completeLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(true);
  });

  it('If there are 1+ bonds, should return true if all sections are in status `Completed`', () => {
    const deal = {
      loanTransactions: { items: [] },
      bondTransactions: completeBonds,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(true);
  });

  it('If there are 1+ bonds and 1+ loans, should return true if all sections are in status `Completed`', () => {
    const deal = {
      bondTransactions: completeBonds,
      loanTransactions: completeLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(true);
  });

  it('If the `Acknowledged` facility have all the required properties', () => {
    const deal = {
      bondTransactions: acknowledgedLoans,
      loanTransactions: acknowledgedBonds,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(true);
  });

  it('If the `Acknowledged` bond and loan does have all the required properties', () => {
    const completeAcknowledgedLoan = {
      ...acknowledgedLoans,
      items: [
        {
          _id: '12345678911',
          status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED,
          requestedCoverStartDate: 123,
          coverDateConfirmed: true,
        },
        {
          _id: '12345678912',
          status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED,
          requestedCoverStartDate: 123,
          coverDateConfirmed: true,
        },
      ],
    };

    const completeAcknowledgedBond = {
      ...acknowledgedBonds,
      items: [
        {
          _id: '12345678911',
          status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED,
          requestedCoverStartDate: 123,
          coverDateConfirmed: true,
        },
        {
          _id: '12345678912',
          status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED,
          requestedCoverStartDate: 123,
          coverDateConfirmed: true,
        },
      ],
    };

    const deal = {
      bondTransactions: completeAcknowledgedLoan,
      loanTransactions: completeAcknowledgedBond,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(isEveryDealFormComplete(deal)).toEqual(true);
  });
});

describe('isEligibilityComplete', () => {
  it("should return true when eligibility status is 'completed'", () => {
    const deal = {
      eligibility: {
        status: CONSTANTS.STATUS.SECTION.COMPLETED,
      },
    };
    const result = isEligibilityComplete(deal);
    expect(result).toEqual(true);
  });

  it("should return false when eligibility status is not 'completed'", () => {
    const deal = {
      eligibility: {
        status: CONSTANTS.STATUS.SECTION.IN_PROGRESS,
      },
    };
    const result = isEligibilityComplete(deal);
    expect(result).toEqual(false);
  });

  it('should return false when eligibility status is undefined', () => {
    const deal = {
      eligibility: {},
    };
    const result = isEligibilityComplete(deal);
    expect(result).toEqual(false);
  });

  it('should return false when deal object is undefined', () => {
    const result = isEligibilityComplete(undefined);
    expect(result).toEqual(false);
  });

  it('should return false when eligibility object is undefined', () => {
    const deal = {};
    const result = isEligibilityComplete(deal);
    expect(result).toEqual(false);
  });

  it('should return false when status property of eligibility object is undefined', () => {
    const deal = {
      eligibility: {},
    };
    const result = isEligibilityComplete(deal);
    expect(result).toEqual(false);
  });
});

describe('isSubmissionDetailComplete', () => {
  it("should return true when submissionDetails status is 'completed'", () => {
    const deal = {
      submissionDetails: {
        status: CONSTANTS.STATUS.SECTION.COMPLETED,
      },
    };
    const result = isSubmissionDetailComplete(deal);
    expect(result).toEqual(true);
  });

  it("should return false when submissionDetails status is not 'completed'", () => {
    const deal = {
      submissionDetails: {
        status: CONSTANTS.STATUS.SECTION.IN_PROGRESS,
      },
    };
    const result = isSubmissionDetailComplete(deal);
    expect(result).toEqual(false);
  });

  it('should return false when submissionDetails status is undefined', () => {
    const deal = {
      submissionDetails: {},
    };
    const result = isSubmissionDetailComplete(deal);
    expect(result).toEqual(false);
  });

  it('should return false when deal object is undefined', () => {
    const result = isSubmissionDetailComplete(undefined);
    expect(result).toEqual(false);
  });

  it('should return false when submissionDetails object is undefined', () => {
    const deal = {};
    const result = isSubmissionDetailComplete(deal);
    expect(result).toEqual(false);
  });

  it('should return false when status property of submissionDetails object is undefined', () => {
    const deal = {
      submissionDetails: {},
    };
    const result = isSubmissionDetailComplete(deal);
    expect(result).toEqual(false);
  });
});
