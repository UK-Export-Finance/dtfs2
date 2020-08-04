import canIssueFacility from './canIssueFacility';

describe('canIssueFacility', () => {
  const mockUserRoles = ['maker'];

  const mockLoanThatCanBeIssued = {
    facilityStage: 'Conditional',
    issueFacilityDetailsSubmitted: false,
  };

  describe('when user is a maker, deal has status `Acknowledged by UKEF`, AIN submissionType and a Conditional loan that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Automatic Inclusion Notice',
        },
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when user is a maker, deal has status `Ready for Checker\'s approval`, MIN submissionType and a Conditional loan that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Ready for Checker\'s approval',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when user is a maker, deal has status `Ready for Checker\'s approval`, MIN submissionType and an Unissued bond that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Ready for Checker\'s approval',
          submissionType: 'Manual Inclusion Notice',
        },
      };
      const mockBondThatCanBeIssued = {
        issueFacilityDetailsSubmitted: false,
        bondStage: 'Unissued',
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockBondThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when user is NOT a maker', () => {
    it('should return false', () => {
      const checkerUserRole = ['checker'];
      const mockDeal = {
        details: {
          status: 'Ready for Checker\'s approval',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      expect(canIssueFacility(checkerUserRole, mockDeal, mockLoanThatCanBeIssued)).toEqual(false);
    });
  });

  describe('when deal status is NOT `Acknowledged by UKEF` or `Ready for Checker\'s approval`', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Some other status',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(false);
    });
  });

  describe('when deal submissionType is NOT `Automatic Inclusion Notice` or `Manual Inclusion Notice`', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Some other submission type',
        },
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(false);
    });
  });

  describe('when facility.facilityStage is `Unconditional`', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      const mockLoan = {
        facilityStage: 'Unconditional',
        issueFacilityDetailsSubmitted: false,
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(false);
    });
  });

  describe('when facility.facilityStage is `Issued`', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      const mockBond = {
        facilityStage: 'Issued',
        issueFacilityDetailsSubmitted: false,
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockBond)).toEqual(false);
    });
  });

  describe('when facility.issueFacilityDetailsSubmitted is true', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      const mockLoan = {
        facilityStage: 'Conditional',
        issueFacilityDetailsSubmitted: true,
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(false);
    });
  });
});
