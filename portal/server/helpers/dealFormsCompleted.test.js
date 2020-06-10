import dealFormsCompleted from './dealFormsCompleted';

const completeBonds = {
  items: [
    { _id: '12345678911', status: 'Completed' },
    { _id: '12345678910', status: 'Completed' },
  ],
};

const incompleteBonds = {
  items: [
    { _id: '12345678910', status: 'Incomplete' },
  ],
};

const incompleteSubmissionDetails = { status: 'not completed' };
const completeSubmissionDetails = { status: 'Completed' };

const incompleteEligibility = { status: 'not completed' };
const completeEligibility = { status: 'Completed' };

describe('dealFormsCompleted', () => {
  it('should return false when a deal\'s eligibility.status is NOT `Completed`', () => {
    const deal = {
      eligibility: incompleteEligibility,
      bondTransactions: completeBonds,
      submissionDetails: completeSubmissionDetails,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it('should return false when a deal\'s submissionDetails.status is NOT `Completed`', () => {
    const deal = {
      submissionDetails: incompleteSubmissionDetails,
      bondTransactions: completeBonds,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it('should return false if a deal has no bonds`', () => {
    const deal = {
      bondTransactions: { items: [] },
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  it('should return false if a deal has any bonds who\'s bond.status is NOT `Completed`', () => {
    const deal = {
      bondTransactions: incompleteBonds,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(false);
  });

  xit('should return false if a deal has any loan who\'s loan.status is NOT `Completed`', () => {
    // const deal = {
    //   bondTransactions: incompleteBonds,
    //   submissionDetails: completeSubmissionDetails,
    //   eligibility: completeEligibility,
    // };
    //
    // expect( dealFormsCompleted(deal) ).toEqual(false);
  });

  it('should return true if all sections are in status `Completed`', () => {
    const deal = {
      bondTransactions: completeBonds,
      submissionDetails: completeSubmissionDetails,
      eligibility: completeEligibility,
    };

    expect(dealFormsCompleted(deal)).toEqual(true);
  });
});
