import userCanIssueFacility from './userCanIssueFacility';

describe('userCanIssueFacility', () => {
  const mockUser = { roles: ['maker'] };

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

      expect(userCanIssueFacility(mockUser, mockDeal, mockLoanThatCanBeIssued)).toEqual(true);
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

      expect(userCanIssueFacility(mockUser, mockDeal, mockLoanThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when user is NOT a maker', () => {
    it('should return false', () => {
      const checkerUser = { roles: ['checker'] };
      const mockDeal = {
        details: {
          status: 'Ready for Checker\'s approval',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      expect(userCanIssueFacility(checkerUser, mockDeal, mockLoanThatCanBeIssued)).toEqual(false);
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

      expect(userCanIssueFacility(mockUser, mockDeal, mockLoanThatCanBeIssued)).toEqual(false);
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

      expect(userCanIssueFacility(mockUser, mockDeal, mockLoanThatCanBeIssued)).toEqual(false);
    });
  });

  describe('when loan.facilityStage is NOT `Conditional`', () => {
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

      expect(userCanIssueFacility(mockUser, mockDeal, mockLoan)).toEqual(false);
    });
  });

  describe('when loan.issueFacilityDetailsSubmitted is true', () => {
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

      expect(userCanIssueFacility(mockUser, mockDeal, mockLoan)).toEqual(false);
    });
  });
});
