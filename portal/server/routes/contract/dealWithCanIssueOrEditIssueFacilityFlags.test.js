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
    facilities: [
      {
        type: 'bond',
        facilityStage: 'Unissued',
        hasBeenIssued: false,
        status: 'Not started',
      },
      {
        type: 'bond',
        facilityStage: 'Issued',
        hasBeenIssued: true,
        status: 'Completed',
      },
      {
        type: 'loan',
        facilityStage: 'Conditional',
        hasBeenIssued: false,
        status: 'Not started',
      },
      {
        type: 'loan',
        facilityStage: 'Unconditional',
        hasBeenIssued: true,
        status: 'Completed',
      },
    ],
  };

  it('should return bonds with canIssueOrEditIssueFacility result', () => {
    const result = dealWithCanIssueOrEditIssueFacilityFlags(mockUserRoles, mockDeal);

    const bonds = mockDeal.facilities.filter((facility) => facility.type === 'Bond');

    const expectedBonds = bonds.map((bond) => {
      const b = bond;
      b.canIssueOrEditIssueFacility = canIssueOrEditIssueFacility(mockUserRoles, mockDeal, bond);
      return b;
    });

    const loans = mockDeal.facilities.filter((facility) => facility.type === 'Loan');

    const expectedLoans = loans.map((loan) => {
      const l = loan;
      l.canIssueOrEditIssueFacility = canIssueOrEditIssueFacility(mockUserRoles, mockDeal, loan);
      return l;
    });

    const expected = {
      ...mockDeal,
      bonds: expectedBonds,
      loans: expectedLoans,
    };

    expect(result).toEqual(expected);
  });
});
