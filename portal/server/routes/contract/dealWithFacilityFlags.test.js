import dealWithFacilityFlags from './dealWithFacilityFlags';
import canIssueOrEditIssueFacility from './canIssueOrEditIssueFacility';
import canAmendFacility from './canAmendFacility';

describe('dealWithFacilityFlags', () => {
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

  it('should return bonds with facility flag results', () => {
    const result = dealWithFacilityFlags(mockUserRoles, mockDeal);

    const expectedBonds = mockDeal.bondTransactions.items.map((bond) => {
      const b = bond;
      b.canIssueOrEditIssueFacility = canIssueOrEditIssueFacility(mockUserRoles, mockDeal, bond);
      b.canAmendFacility = canAmendFacility(mockUserRoles, mockDeal);
      return b;
    });

    const expectedLoans = mockDeal.loanTransactions.items.map((loan) => {
      const l = loan;
      l.canIssueOrEditIssueFacility = canIssueOrEditIssueFacility(mockUserRoles, mockDeal, loan);
      l.canAmendFacility = canAmendFacility(mockUserRoles, mockDeal);
      return l;
    });

    const bonds = result.bondTransactions.items;
    const loans = result.loanTransactions.items;

    expect(bonds).toEqual(expectedBonds);
    expect(loans).toEqual(expectedLoans);
  });
});
