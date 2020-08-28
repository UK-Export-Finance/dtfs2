import dealWithCanIssueOrEditIssueFacilityFlags from './dealWithCanIssueOrEditIssueFacilityFlags';
import canIssueOrEditIssueFacility from './canIssueOrEditIssueFacility';

describe('dealWithCanIssueOrEditIssueFacilityFlags', () => {
  const mockUserRoles = ['maker'];

  const mockDeal = {
    details: {
      submissionType: 'Automatic Inclusion Notice',
      status: 'Further Maker\'s input required',
      submissionDate: 12345678,
    },
    bondTransactions: {
      items: [
        { bondStage: 'Unissued', status: 'Not started' },
        { bondStage: 'Issued', status: 'Completed' },
      ],
    },
    loanTransactions: {
      items: [
        { facilityStage: 'Conditional', status: 'Not started' },
        { facilityStage: 'Unconditional', status: 'Completed' },
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
