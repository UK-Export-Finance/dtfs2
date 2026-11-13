import { ROLES } from '@ukef/dtfs2-common';
import dealWithCanIssueOrEditIssueFacilityFlags from './dealWithCanIssueOrEditIssueFacilityFlags';
import canIssueOrEditIssueFacility from './canIssueOrEditIssueFacility';

const { MAKER } = ROLES;

describe('dealWithCanIssueOrEditIssueFacilityFlags', () => {
  const mockUserRoles = [MAKER];

  const mockDeal = {
    submissionType: 'Automatic Inclusion Notice',
    status: "Further Maker's input required",
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
      const expectedBond = bond;

      expectedBond.canIssueOrEditIssueFacility = canIssueOrEditIssueFacility(mockUserRoles, mockDeal, bond);

      return expectedBond;
    });

    const expectedLoans = mockDeal.loanTransactions.items.map((loan) => {
      const expectedLoan = loan;

      expectedLoan.canIssueOrEditIssueFacility = canIssueOrEditIssueFacility(mockUserRoles, mockDeal, loan);

      return expectedLoan;
    });

    const bonds = result.bondTransactions.items;
    const loans = result.loanTransactions.items;

    expect(bonds).toEqual(expectedBonds);
    expect(loans).toEqual(expectedLoans);
  });
});
