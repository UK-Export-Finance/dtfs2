import { dealFormsCompleted, dealHasIncompleteTransactions } from './dealFormsCompleted';

const completeFacilities = [
  { _id: '12345678911', status: 'Completed' },
  { _id: '12345678910', status: 'Completed' },
  { _id: '12345678910', status: 'Acknowledged' },
];

const incompleteFacilities = [
  { _id: '12345678911', status: 'Completed' },
  { _id: '12345678910', status: 'Incomplete' },
];

const completeBonds = completeFacilities.map((f) => ({ ...f, type: 'Bond' }));
const incompleteBonds = incompleteFacilities.map((f) => ({ ...f, type: 'Bond' }));

const completeLoans = completeFacilities.map((f) => ({ ...f, type: 'Loan' }));
const incompleteLoans = incompleteFacilities.map((f) => ({ ...f, type: 'Loan' }));

const incompleteSubmissionDetails = { status: 'not completed' };
const completeSubmissionDetails = { status: 'Completed' };

const incompleteEligibility = { status: 'not completed' };
const completeEligibility = { status: 'Completed' };

describe('dealHasIncompleteTransactions', () => {
  it('should return true if a deal has any bonds who\'s bond.status is NOT `Completed`', () => {
    const deal = {
      facilities: incompleteBonds,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealHasIncompleteTransactions(deal)).toEqual(true);
  });

  it('should return true if a deal has any loan who\'s loan.status is NOT `Completed`', () => {
    const deal = {
      facilities: incompleteLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealHasIncompleteTransactions(deal)).toEqual(true);
  });

  it('should return false when all bonds have `Completed` status ', () => {
    const deal = {
      facilities: completeBonds,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealHasIncompleteTransactions(deal)).toEqual(false);
  });

  it('should return false when all loans have `Completed` status ', () => {
    const deal = {
      facilities: completeLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealHasIncompleteTransactions(deal)).toEqual(false);
  });
});

describe('dealFormsCompleted', () => {
  it('should return false when a deal\'s eligibility.status is NOT `Completed`', () => {
    const deal = {
      eligibility: incompleteEligibility,
      facilities: completeBonds,
      submissionDetails: completeSubmissionDetails,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it('should return false when a deal\'s submissionDetails.status is NOT `Completed`', () => {
    const deal = {
      submissionDetails: incompleteSubmissionDetails,
      facilities: completeFacilities,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it('should return false if a deal has no bonds and no loans`', () => {
    const deal = {
      facilities: [],
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it('should return false if a deal has any bonds who\'s bond.status is NOT `Completed`', () => {
    const deal = {
      facilities: incompleteBonds,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it('should return false if a deal has any loan who\'s loan.status is NOT `Completed`', () => {
    const deal = {
      facilities: incompleteLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it('If there are 1+ loans, should return true if all sections are in status `Completed`', () => {
    const deal = {
      facilities: completeLoans,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(true);
  });

  it('If there are 1+ bonds, should return true if all sections are in status `Completed`', () => {
    const deal = {
      facilities: completeBonds,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(true);
  });

  it('If there are 1+ bonds and 1+ loans, should return true if all sections are in status `Completed`', () => {
    const deal = {
      facilities: [
        ...completeBonds,
        ...completeLoans,
      ],
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(true);
  });
});
