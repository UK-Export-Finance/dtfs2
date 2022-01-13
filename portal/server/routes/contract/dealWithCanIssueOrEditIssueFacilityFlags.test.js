import dealWithCanIssueOrEditIssueFacilityFlags from './dealWithCanIssueOrEditIssueFacilityFlags';
import canIssueOrEditIssueFacility from './canIssueOrEditIssueFacility';

describe('dealWithCanIssueOrEditIssueFacilityFlags', () => {
  const mockUserRoles = ['maker'];

  const mockDeal = {
    submissionType: 'Automatic Inclusion Notice',
    status: 'Further Maker\'s input required',
    details: {
      submissionDate: 12345678,
    },
    bondTransactions: {
      items: [
        {
          facilityStage: 'Unissued',
          hasBeenIssued: false,
          status: 'Not started',
        },
        {
          facilityStage: 'Issued',
          hasBeenIssued: true,
          status: 'Completed',
        },
      ],
    },
    loanTransactions: {
      items: [
        { facilityStage: 'Conditional', hasBeenIssued: false, status: 'Not started' },
        { facilityStage: 'Unconditional', hasBeenIssued: true, status: 'Completed' },
      ],
    },
  };

  it('should return bonds with canIssueOrEditIssueFacility result', () => {
    const result = dealWithCanIssueOrEditIssueFacilityFlags(mockUserRoles, mockDeal);

    const expectedBonds = mockDeal.bondTransactions.items.map((bond) => {
      const b = bond;
      b.canIssueOrEditIssueFacility = canIssueOrEditIssueFacility(mockUserRoles, mockDeal, bond);
      return b;
    });

    const expectedLoans = mockDeal.loanTransactions.items.map((loan) => {
      const l = loan;
      l.canIssueOrEditIssueFacility = canIssueOrEditIssueFacility(mockUserRoles, mockDeal, loan);
      return l;
    });

    const bonds = result.bondTransactions.items;
    const loans = result.loanTransactions.items;

    expect(bonds).toEqual(expectedBonds);
    expect(loans).toEqual(expectedLoans);
  });
});
