import { dealFormsCompleted, dealHasIncompleteTransactions } from './dealFormsCompleted';
import CONSTANTS from '../constants';

const completeFacilities = {
  items: [
    { _id: '12345678910', status: CONSTANTS.STATUS.SECTION.COMPLETED },
    { _id: '12345678911', status: CONSTANTS.STATUS.SECTION.COMPLETED },
    { _id: '12345678912', status: CONSTANTS.STATUS.SECTION.COMPLETED },
  ],
};

const incompleteFacilities = {
  items: [
    { _id: '12345678911', status: CONSTANTS.STATUS.SECTION.COMPLETED },
    { _id: '12345678910', status: CONSTANTS.STATUS.SECTION.INCOMPLETE },
  ],
};

const acknowledgedFacilities = {
  items: [
    { _id: '12345678911', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: 123, coverDateConfirmed: true },
    { _id: '12345678912', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: 123, coverDateConfirmed: true },
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
const acknowledgedLoan = {
  ...completeFacilities,
  acknowledgedFacilities,
};

const incompleteSubmissionDetails = { status: CONSTANTS.STATUS.SECTION.NOT_COMPLETED };
const completeSubmissionDetails = { status: CONSTANTS.STATUS.SECTION.COMPLETED };
const incompleteEligibility = { status: CONSTANTS.STATUS.SECTION.NOT_COMPLETED };
const completeEligibility = { status: CONSTANTS.STATUS.SECTION.COMPLETED };

describe('dealHasIncompleteTransactions', () => {
  it("should return true if a deal has any bonds who's bond.status is NOT `Completed`", () => {
    const deal = {
      bondTransactions: incompleteBonds,
      loanTransactions: { items: [] },
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealHasIncompleteTransactions(deal)).toEqual(true);
  });

  it("should return true if a deal has any loan who's loan.status is NOT `Completed`", () => {
    const deal = {
      bondTransactions: { items: [] },
      loanTransactions: incompleteLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealHasIncompleteTransactions(deal)).toEqual(true);
  });

  it('should return false when all bonds have `Completed` status ', () => {
    const deal = {
      bondTransactions: completeBonds,
      loanTransactions: { items: [] },
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealHasIncompleteTransactions(deal)).toEqual(false);
  });

  it('should return false when all loans have `Completed` status ', () => {
    const deal = {
      bondTransactions: { items: [] },
      loanTransactions: completeLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealHasIncompleteTransactions(deal)).toEqual(false);
  });

  it('If the `Acknowledged` loan does not have all the required properties', () => {
    const incompleteAcknowledgedLoan = {
      ...acknowledgedLoan,
      items: [
        { _id: '12345678911', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: null },
        { _id: '12345678912', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: 123, coverDateConfirmed: true },
      ],
    };

    const deal = {
      bondTransactions: incompleteAcknowledgedLoan,
      loanTransactions: acknowledgedBonds,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it('If the `Acknowledged` loans does not have all the required properties', () => {
    const incompleteAcknowledgedLoan = {
      ...acknowledgedLoan,
      items: [
        { _id: '12345678911', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: null },
        { _id: '12345678912', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: null },
      ],
    };

    const deal = {
      bondTransactions: incompleteAcknowledgedLoan,
      loanTransactions: acknowledgedBonds,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it('If the `Acknowledged` bond and loan does not have all the required properties', () => {
    const incompleteAcknowledgedLoan = {
      ...acknowledgedLoan,
      items: [
        { _id: '12345678911', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: null },
        { _id: '12345678912', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: null },
      ],
    };

    const incompleteAcknowledgedBond = {
      ...acknowledgedBonds,
      items: [
        { _id: '12345678911', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: null },
        { _id: '12345678912', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: 123, coverDateConfirmed: true },
      ],
    };

    const deal = {
      bondTransactions: incompleteAcknowledgedLoan,
      loanTransactions: incompleteAcknowledgedBond,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });
});

describe('dealFormsCompleted', () => {
  it("should return false when a deal's eligibility.status is NOT `Completed`", () => {
    const deal = {
      eligibility: incompleteEligibility,
      bondTransactions: completeBonds,
      submissionDetails: completeSubmissionDetails,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it("should return false when a deal's submissionDetails.status is NOT `Completed`", () => {
    const deal = {
      submissionDetails: incompleteSubmissionDetails,
      bondTransactions: completeBonds,
      loanTransactions: completeLoans,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it('should return false if a deal has no bonds and no loans`', () => {
    const deal = {
      bondTransactions: { items: [] },
      loanTransactions: { items: [] },
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it("should return false if a deal has any bonds who's bond.status is NOT `Completed`", () => {
    const deal = {
      bondTransactions: incompleteBonds,
      loanTransactions: { items: [] },
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it("should return false if a deal has any loan who's loan.status is NOT `Completed`", () => {
    const deal = {
      bondTransactions: { items: [] },
      loanTransactions: incompleteLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it('If there are 1+ loans, should return true if all sections are in status `Completed`', () => {
    const deal = {
      bondTransactions: { items: [] },
      loanTransactions: completeLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(true);
  });

  it('If there are 1+ bonds, should return true if all sections are in status `Completed`', () => {
    const deal = {
      loanTransactions: { items: [] },
      bondTransactions: completeBonds,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(true);
  });

  it('If there are 1+ bonds and 1+ loans, should return true if all sections are in status `Completed`', () => {
    const deal = {
      bondTransactions: completeBonds,
      loanTransactions: completeLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(true);
  });

  it('If the `Acknowledged` facility have all the required properties', () => {
    const deal = {
      bondTransactions: acknowledgedLoan,
      loanTransactions: acknowledgedBonds,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(true);
  });

  it('If the `Acknowledged` bond and loan does have all the required properties', () => {
    const completeAcknowledgedLoan = {
      ...acknowledgedLoan,
      items: [
        { _id: '12345678911', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: 123, coverDateConfirmed: true },
        { _id: '12345678912', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: 123, coverDateConfirmed: true },
      ],
    };

    const completeAcknowledgedBond = {
      ...acknowledgedBonds,
      items: [
        { _id: '12345678911', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: 123, coverDateConfirmed: true },
        { _id: '12345678912', status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: 123, coverDateConfirmed: true },
      ],
    };

    const deal = {
      bondTransactions: completeAcknowledgedLoan,
      loanTransactions: completeAcknowledgedBond,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(true);
  });
});
